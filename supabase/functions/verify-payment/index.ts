import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

interface VerifyBody { session_id?: string }

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');
    logStep('Stripe key verified');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header provided');
    const token = authHeader.replace('Bearer ', '');

    // Authenticate the user (used for attribution if metadata missing)
    const { data: userData, error: userError } = await db.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error('User not authenticated or email not available');
    logStep('User authenticated', { userId: user.id, email: user.email });

    const body: VerifyBody = await req.json();
    const sessionId = body.session_id;
    if (!sessionId) throw new Error('Missing session_id');

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'line_items']
    });
    logStep('Retrieved checkout session', { id: session.id, status: session.payment_status, mode: session.mode });

    if (session.payment_status !== 'paid') {
      throw new Error(`Payment not completed. Status: ${session.payment_status}`);
    }

    if (session.mode !== 'subscription') {
      throw new Error('This verification function only handles subscription checkouts');
    }

    // Extract metadata and subscription details
    const meta = (session.metadata || {}) as Record<string, string>;
    const siteId = meta.site_id && meta.site_id !== '' ? meta.site_id : null;
    const plan = meta.plan || null;
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : (session.customer?.id ?? null);

    // Ensure we have a Stripe subscription
    const sub = typeof session.subscription === 'string'
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription;

    if (!sub) throw new Error('Stripe subscription not found on session');

    const currentPeriodStart = new Date(sub.current_period_start * 1000).toISOString();
    const currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
    const unitAmount = sub.items.data[0]?.price?.unit_amount ?? 0;
    
    // Determine billing cycle from Stripe interval
    const priceInterval = sub.items.data[0]?.price?.recurring?.interval;
    const billingCycle = priceInterval === 'year' ? 'yearly' : 'monthly';
    logStep('Detected billing cycle', { interval: priceInterval, billingCycle });

    // Check for existing subscription with same Stripe subscription ID
    const { data: existing, error: existingErr } = await db
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', sub.id)
      .maybeSingle();

    if (existingErr) throw existingErr;

    // Check for other active subscriptions for same user/site to prevent duplicates
    if (siteId) {
      const { data: duplicates, error: dupErr } = await db
        .from('subscriptions')
        .select('id, stripe_subscription_id')
        .eq('user_id', user.id)
        .eq('site_id', siteId)
        .eq('status', 'active')
        .neq('stripe_subscription_id', sub.id);
      
      if (dupErr) throw dupErr;
      
      // Cancel old subscriptions for same site
      if (duplicates && duplicates.length > 0) {
        for (const dup of duplicates) {
          try {
            await stripe.subscriptions.cancel(dup.stripe_subscription_id);
            logStep('Cancelled old Stripe subscription', { id: dup.stripe_subscription_id });
          } catch (err) {
            logStep('Failed to cancel old subscription', { id: dup.stripe_subscription_id, error: err });
          }
        }
        
        const { error: cancelErr } = await db
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('user_id', user.id)
          .eq('site_id', siteId)
          .eq('status', 'active')
          .neq('stripe_subscription_id', sub.id);
        
        if (cancelErr) throw cancelErr;
        logStep('Cancelled duplicate subscriptions in database', { count: duplicates.length });
      }
    }

    if (!existing) {
      const { error: insertErr } = await db.from('subscriptions').insert({
        user_id: user.id,
        site_id: siteId,
        amount: unitAmount,
        currency: 'usd',
        status: 'active',
        plan_type: plan,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: sub.id,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
      });
      if (insertErr) throw insertErr;
      logStep('Inserted subscription record', { stripe_subscription_id: sub.id });
    } else {
      // Update status/periods if needed
      const { error: updateErr } = await db.from('subscriptions').update({
        status: 'active',
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
      }).eq('id', existing.id);
      if (updateErr) throw updateErr;
      logStep('Updated existing subscription record', { id: existing.id });
    }

    // Update website record with subscription details and next payment info
    if (siteId) {
      // Check if this is the first payment
      const { data: websiteData } = await db
        .from('websites')
        .select('initial_payment_received')
        .eq('id', siteId)
        .single();
      
      const isFirstPayment = !websiteData?.initial_payment_received;
      const nextPaymentDate = new Date(sub.current_period_end * 1000);
      
      // Calculate next payment date based on actual payment date for first payment
      let calculatedNextPaymentDate = nextPaymentDate;
      if (isFirstPayment) {
        const now = new Date();
        calculatedNextPaymentDate = new Date(now);
        if (billingCycle === 'monthly') {
          calculatedNextPaymentDate.setMonth(calculatedNextPaymentDate.getMonth() + 1);
        } else {
          calculatedNextPaymentDate.setFullYear(calculatedNextPaymentDate.getFullYear() + 1);
        }
        logStep('First payment detected, calculating next payment date from payment date', { 
          paymentDate: now.toISOString(), 
          calculatedNextPaymentDate: calculatedNextPaymentDate.toISOString() 
        });
      }
      
      const { error: websiteUpdateErr } = await db
        .from('websites')
        .update({
          stripe_subscription_id: sub.id,
          billing_cycle: billingCycle,
          next_payment_date: calculatedNextPaymentDate.toISOString(),
          next_payment_amount: unitAmount / 100, // Convert cents to dollars for display
          payment_status: 'current',
          initial_payment_received: true,
          domain_live_date: null // Clear any grace period when payment is received
        })
        .eq('id', siteId);
      
      if (websiteUpdateErr) {
        logStep('Warning: Failed to update website record', { error: websiteUpdateErr });
      } else {
        logStep('Updated website with subscription details', { 
          siteId, 
          billingCycle, 
          nextPaymentDate: calculatedNextPaymentDate.toISOString(),
          isFirstPayment 
        });
      }
    }

    // Check if payment already recorded for this session to prevent duplicates
    const { data: existingPayment } = await db
      .from('payments')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();

    if (existingPayment) {
      logStep("Payment already recorded for this session", { sessionId });
      return new Response(JSON.stringify({ success: true, message: 'Payment already recorded' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Record successful payment in payments table (amount in cents)
    
    // Try to get invoice information from the session
    let invoiceUrl = null;
    let invoiceNumber = null;
    let paymentIntentId = null;
    
    try {
      // Get payment intent from session if available
      if (session.payment_intent) {
        const paymentIntent = typeof session.payment_intent === 'string' 
          ? await stripe.paymentIntents.retrieve(session.payment_intent)
          : session.payment_intent;
        paymentIntentId = paymentIntent.id;
        
        // Try to get invoice from payment intent
        if (paymentIntent.invoice) {
          const invoice = await stripe.invoices.retrieve(paymentIntent.invoice.toString());
          invoiceUrl = invoice.hosted_invoice_url;
          invoiceNumber = invoice.number;
        }
      }
    } catch (err) {
      logStep("Warning: Could not retrieve invoice details", { error: err.message });
    }
    
    const { error: paymentRecordError } = await db
      .from('payments')
      .insert({
        user_id: user.id,
        site_id: siteId,
        amount: unitAmount, // Store in cents (Stripe standard)
        status: 'completed',
        plan_type: plan || 'basic',
        method: 'stripe',
        payment_date: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntentId,
        stripe_session_id: sessionId,
        invoice_url: invoiceUrl,
        invoice_number: invoiceNumber
      });

    if (paymentRecordError) {
      logStep("Warning: Failed to record completed payment", { error: paymentRecordError });
      // Don't fail the verification for this, but log it
    } else {
      logStep("Completed payment recorded in payments table");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep('ERROR in verify-payment', { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
