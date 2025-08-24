import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DOWNLOAD-RECEIPT] ${step}${detailsStr}`);
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

    const { paymentId } = await req.json();
    if (!paymentId) throw new Error("Payment ID is required");

    // Get payment details from database
    const { data: payment, error: paymentError } = await supabaseServiceClient
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .single();

    if (paymentError || !payment) {
      throw new Error("Payment not found or access denied");
    }

    logStep("Found payment", { paymentId: payment.id, amount: payment.amount });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // If we have an invoice URL, redirect to it
    if (payment.invoice_url) {
      logStep("Redirecting to existing invoice URL", { url: payment.invoice_url });
      return new Response(JSON.stringify({ 
        success: true, 
        url: payment.invoice_url,
        type: 'redirect'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Try to find and create invoice from Stripe
    if (payment.stripe_payment_intent_id) {
      try {
        // Get the payment intent to find the invoice
        const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripe_payment_intent_id);
        if (paymentIntent.invoice) {
          const invoice = await stripe.invoices.retrieve(paymentIntent.invoice.toString());
          if (invoice.hosted_invoice_url) {
            // Update our database with the invoice URL
            await supabaseServiceClient
              .from('payments')
              .update({ 
                invoice_url: invoice.hosted_invoice_url,
                invoice_number: invoice.number 
              })
              .eq('id', payment.id);

            logStep("Found and updated invoice URL", { url: invoice.hosted_invoice_url });
            return new Response(JSON.stringify({ 
              success: true, 
              url: invoice.hosted_invoice_url,
              type: 'redirect'
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
        }
      } catch (error) {
        logStep("Error retrieving Stripe invoice", { error: error.message });
      }
    }

    // Generate a simple receipt as fallback
    const receiptData = {
      receiptId: payment.id,
      date: payment.payment_date,
      amount: payment.amount,
      planType: payment.plan_type,
      status: payment.status,
      method: payment.method || 'stripe',
      userEmail: user.email
    };

    logStep("Generating fallback receipt", { receiptId: payment.id });

    return new Response(JSON.stringify({ 
      success: true, 
      receipt: receiptData,
      type: 'data'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in download-receipt", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});