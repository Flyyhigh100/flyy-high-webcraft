import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

interface CheckoutRequest {
  plan: 'basic' | 'standard' | 'premium';
  siteId?: string;
  invitation_payment?: boolean;
  amount?: number; // Custom amount from invitation
  billingCycle?: 'monthly' | 'yearly'; // New billing cycle option
  prorationAmount?: number; // For mid-cycle plan changes
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

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
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { plan, siteId, invitation_payment, amount, billingCycle = 'monthly', prorationAmount }: CheckoutRequest = await req.json();
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          site_id: siteId || ''
        }
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    // Use custom amount if this is an invitation payment, otherwise use default pricing
    let planAmount, planName, interval;
    if (invitation_payment && amount) {
      planAmount = amount; // Amount already in cents from frontend
      planName = `${plan.charAt(0).toUpperCase() + plan.slice(1)} Hosting Plan (Invited)`;
      interval = "month";
      logStep("Using invitation amount", { amount, plan });
    } else {
      // Define pricing based on plan and billing cycle
      const pricing = {
        basic: { 
          monthly: { amount: 1500, name: "Basic Hosting Plan" }, // $15.00/month
          yearly: { amount: 1000, name: "Basic Hosting Plan (Annual)" } // $10.00/month when billed yearly
        },
        standard: { 
          monthly: { amount: 3000, name: "Pro Hosting Plan" }, // $30.00/month  
          yearly: { amount: 2000, name: "Pro Hosting Plan (Annual)" } // $20.00/month when billed yearly
        },
        premium: { 
          monthly: { amount: 2999, name: "Premium Hosting Plan" }, // $29.99/month
          yearly: { amount: 2400, name: "Premium Hosting Plan (Annual)" } // $24.00/month when billed yearly
        }
      };
      
      const selectedPlan = pricing[plan]?.[billingCycle];
      if (!selectedPlan) throw new Error("Invalid plan or billing cycle selected");
      
      // Apply proration if provided
      planAmount = prorationAmount || selectedPlan.amount;
      planName = selectedPlan.name;
      interval = billingCycle === 'yearly' ? 'year' : 'month';
      
      logStep("Using plan pricing", { plan, billingCycle, amount: planAmount, interval });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: planName,
              description: `${interval === 'year' ? 'Annual' : 'Monthly'} hosting for your website`
            },
            unit_amount: planAmount,
            recurring: { interval: interval as 'month' | 'year' },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
      metadata: {
        user_id: user.id,
        plan: plan,
        site_id: siteId || '',
        billing_cycle: billingCycle,
        ...(prorationAmount && { proration_amount: prorationAmount.toString() })
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});