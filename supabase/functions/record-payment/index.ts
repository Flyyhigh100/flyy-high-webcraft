import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RECORD-PAYMENT] ${step}${detailsStr}`);
};

interface RecordPaymentRequest {
  user_id: string;
  site_id?: string;
  amount: number;
  status: string;
  plan_type: string;
  method?: string;
  stripe_payment_intent_id?: string;
  stripe_subscription_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

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

    const paymentData: RecordPaymentRequest = await req.json();
    
    // Record the payment in the payments table
    const { data: payment, error: paymentError } = await supabaseServiceClient
      .from('payments')
      .insert({
        user_id: paymentData.user_id,
        site_id: paymentData.site_id,
        amount: paymentData.amount,
        status: paymentData.status,
        plan_type: paymentData.plan_type,
        method: paymentData.method || 'card',
        payment_date: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentError) {
      logStep("Error recording payment", { error: paymentError });
      throw new Error(`Failed to record payment: ${paymentError.message}`);
    }

    logStep("Payment recorded successfully", { paymentId: payment.id });

    return new Response(JSON.stringify({ 
      success: true, 
      payment_id: payment.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in record-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});