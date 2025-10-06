import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CALCULATE-PRORATION] ${step}${detailsStr}`);
};

interface ProrationRequest {
  currentPlan: 'basic' | 'pro';
  newPlan: 'basic' | 'pro';
  newBillingCycle: 'monthly' | 'yearly';
  subscriptionId?: string;
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { currentPlan, newPlan, newBillingCycle, subscriptionId }: ProrationRequest = await req.json();
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Define pricing
    const pricing = {
      basic: { 
        monthly: 1500, // $15.00/month
        yearly: 1000   // $10.00/month when billed yearly
      },
      pro: { 
        monthly: 3000, // $30.00/month  
        yearly: 2000   // $20.00/month when billed yearly
      }
    };

    const newPlanPrice = pricing[newPlan]?.[newBillingCycle];
    if (!newPlanPrice) throw new Error("Invalid plan or billing cycle");

    let prorationData = {
      currentPlan,
      newPlan,
      newBillingCycle,
      immediateCharge: 0,
      nextBillingAmount: newPlanPrice,
      description: "Plan change preview",
      savings: 0
    };

    // If we have a subscription ID, get current subscription details for accurate proration
    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const currentPeriodEnd = subscription.current_period_end;
        const currentPrice = subscription.items.data[0].price.unit_amount || 0;
        
        // Calculate remaining days in current billing period
        const now = Math.floor(Date.now() / 1000);
        const remainingSeconds = currentPeriodEnd - now;
        const remainingDays = Math.max(0, Math.floor(remainingSeconds / 86400));
        const totalDaysInPeriod = subscription.items.data[0].price.recurring?.interval === 'year' ? 365 : 30;
        
        // Calculate proration
        const unusedValue = Math.floor((currentPrice * remainingDays) / totalDaysInPeriod);
        const newChargeProrated = Math.floor((newPlanPrice * remainingDays) / totalDaysInPeriod);
        
        prorationData.immediateCharge = Math.max(0, newChargeProrated - unusedValue);
        prorationData.description = `${remainingDays} days remaining in current period`;
        
        logStep("Calculated proration", { 
          remainingDays, 
          unusedValue, 
          newChargeProrated, 
          immediateCharge: prorationData.immediateCharge 
        });
      } catch (error) {
        logStep("Could not fetch subscription for proration", { error: error.message });
        // Fall back to simple calculation
      }
    }

    // Calculate yearly savings
    if (newBillingCycle === 'yearly') {
      const monthlyEquivalent = pricing[newPlan].monthly * 12;
      const yearlyTotal = newPlanPrice * 12;
      prorationData.savings = monthlyEquivalent - yearlyTotal;
    }

    return new Response(JSON.stringify(prorationData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in calculate-proration", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});