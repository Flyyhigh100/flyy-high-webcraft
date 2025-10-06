import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

interface CancelRequest {
  subscriptionId: string;
  cancelAt?: 'period_end' | 'now';
  reason?: string;
  comment?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { subscriptionId, cancelAt = 'period_end', reason, comment }: CancelRequest = await req.json();
    if (!subscriptionId) throw new Error("Subscription ID is required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verify subscription belongs to user
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if (typeof customer === 'string' || customer.email !== user.email) {
      throw new Error("Subscription not found or access denied");
    }

    logStep("Subscription verified", { subscriptionId, customerEmail: customer.email });

    // Cancel subscription
    let cancelledSubscription;
    if (cancelAt === 'now') {
      cancelledSubscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      cancelledSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    logStep("Subscription cancelled", { 
      subscriptionId, 
      cancelAt, 
      status: cancelledSubscription.status,
      cancelAtPeriodEnd: cancelledSubscription.cancel_at_period_end 
    });

    // Sync cancellation status to Supabase subscriptions table
    const { error: updateError } = await supabaseClient
      .from('subscriptions')
      .update({
        status: cancelledSubscription.status,
        cancel_at_period_end: cancelledSubscription.cancel_at_period_end,
        canceled_at: cancelAt === 'now' 
          ? new Date().toISOString() 
          : (cancelledSubscription.cancel_at_period_end ? new Date().toISOString() : null),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (updateError) {
      logStep("Failed to update subscription in database", { error: updateError });
      // Log but don't fail - Stripe cancellation already succeeded
    } else {
      logStep("Subscription status synced to database", { 
        subscriptionId,
        newStatus: cancelledSubscription.status,
        cancelAtPeriodEnd: cancelledSubscription.cancel_at_period_end 
      });
    }

    // Store cancellation feedback
    if (reason || comment) {
      await supabaseClient.from('cancellation_feedback').insert({
        user_id: user.id,
        subscription_id: subscriptionId,
        cancellation_reason: reason,
        comment: comment,
        cancelled_at: cancelAt === 'now' ? new Date().toISOString() : new Date(cancelledSubscription.current_period_end * 1000).toISOString()
      });
      logStep("Cancellation feedback stored", { reason, comment });
    }

    // Send cancellation email
    try {
      await supabaseClient.functions.invoke('send-cancellation-email', {
        body: {
          userEmail: user.email,
          subscriptionId,
          cancelAt,
          effectiveDate: cancelAt === 'now' ? new Date() : new Date(cancelledSubscription.current_period_end * 1000),
          planType: subscription.items.data[0]?.price?.nickname || 'Unknown'
        }
      });
      logStep("Cancellation email sent");
    } catch (emailError) {
      logStep("Failed to send cancellation email", { error: emailError });
      // Don't fail the whole operation if email fails
    }

    return new Response(JSON.stringify({
      success: true,
      subscription: {
        id: cancelledSubscription.id,
        status: cancelledSubscription.status,
        cancel_at_period_end: cancelledSubscription.cancel_at_period_end,
        current_period_end: cancelledSubscription.current_period_end
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cancel-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});