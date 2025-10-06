import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RECONCILE-PAYMENTS] ${step}${detailsStr}`);
};

const cleanPlanName = (planType: string): string => {
  if (!planType) return 'basic';
  
  // Remove common suffixes like "(Invited)", "(Trial)", etc.
  return planType
    .replace(/\s*\(invited\)/gi, '')
    .replace(/\s*\(trial\)/gi, '')
    .replace(/\s*\(promo\)/gi, '')
    .trim() || 'basic';
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseServiceClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get user's Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No Stripe customer found",
        paymentsReconciled: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get all successful payment intents for this customer
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 100 // Get recent payments
    });

    // Get all subscriptions and their invoices
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100
    });

    logStep("Found Stripe data", { 
      paymentIntents: paymentIntents.data.length,
      subscriptions: subscriptions.data.length 
    });

    // Get existing payments from our database
    const { data: existingPayments, error: paymentsError } = await supabaseServiceClient
      .from('payments')
      .select('*')
      .eq('user_id', user.id);

    if (paymentsError) throw paymentsError;
    logStep("Found existing payments", { count: existingPayments.length });

    const reconciledPayments = [];

    // Reconcile subscription payments via invoices
    for (const subscription of subscriptions.data) {
      try {
        const invoices = await stripe.invoices.list({
          subscription: subscription.id,
          status: 'paid',
          limit: 50
        });

        for (const invoice of invoices.data) {
          // Check if we already have this payment recorded
          const existingPayment = existingPayments.find(p => 
            p.stripe_payment_intent_id === invoice.payment_intent ||
            (p.payment_date && Math.abs(new Date(p.payment_date).getTime() - (invoice.created * 1000)) < 24 * 60 * 60 * 1000 && p.amount === (invoice.amount_paid / 100))
          );

          if (!existingPayment && invoice.amount_paid > 0) {
            // Record this missing payment
            const { error: insertError } = await supabaseServiceClient
              .from('payments')
              .insert({
                user_id: user.id,
                amount: invoice.amount_paid / 100, // Convert cents to dollars
                status: 'completed',
                plan_type: cleanPlanName(subscription.metadata?.plan || 'Standard'),
                method: 'stripe',
                payment_date: new Date(invoice.created * 1000).toISOString(),
                stripe_payment_intent_id: invoice.payment_intent?.toString() || null,
                stripe_session_id: null, // This will be updated when we get session info
                invoice_url: invoice.hosted_invoice_url || null,
                invoice_number: invoice.number || null
              });

            if (insertError) {
              logStep("Error inserting payment", { error: insertError, invoice: invoice.id });
            } else {
              reconciledPayments.push({
                amount: invoice.amount_paid / 100,
                date: new Date(invoice.created * 1000),
                invoiceId: invoice.id
              });
              logStep("Reconciled payment", { 
                amount: invoice.amount_paid / 100, 
                invoiceId: invoice.id 
              });
            }
          }
        }
      } catch (error) {
        logStep("Error processing subscription", { subscriptionId: subscription.id, error: error.message });
      }
    }

    // Update any pending payments to completed if they exist in Stripe as paid
    for (const payment of existingPayments.filter(p => p.status === 'pending')) {
      // Try to find corresponding paid payment intent
      const matchingIntent = paymentIntents.data.find(pi => 
        pi.status === 'succeeded' && 
        Math.abs(new Date(payment.payment_date).getTime() - (pi.created * 1000)) < 24 * 60 * 60 * 1000
      );

      if (matchingIntent) {
        const { error: updateError } = await supabaseServiceClient
          .from('payments')
          .update({ 
            status: 'completed',
            stripe_payment_intent_id: matchingIntent.id
          })
          .eq('id', payment.id);

        if (!updateError) {
          logStep("Updated pending payment to completed", { paymentId: payment.id });
        }
      }
    }

    logStep("Reconciliation complete", { reconciledCount: reconciledPayments.length });

    return new Response(JSON.stringify({ 
      success: true, 
      paymentsReconciled: reconciledPayments.length,
      payments: reconciledPayments
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in reconcile-payments", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});