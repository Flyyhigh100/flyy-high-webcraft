import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CLEANUP-DUPLICATES] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header provided');
    const token = authHeader.replace('Bearer ', '');

    const { data: userData, error: userError } = await db.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error('User not authenticated');
    logStep('User authenticated', { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Find duplicate active subscriptions for the same user/site
    const { data: allSubs, error: subsError } = await db
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (subsError) throw subsError;

    if (!allSubs || allSubs.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions found', cleaned: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Group by site_id to find duplicates
    const bySite = new Map<string, any[]>();
    for (const sub of allSubs) {
      const siteKey = sub.site_id || 'no-site';
      if (!bySite.has(siteKey)) {
        bySite.set(siteKey, []);
      }
      bySite.get(siteKey)!.push(sub);
    }

    let cleanedCount = 0;
    
    for (const [siteKey, subs] of bySite) {
      if (subs.length > 1) {
        // Keep the most recent one, cancel the rest
        const [keep, ...toCancel] = subs;
        logStep('Found duplicates for site', { siteKey, total: subs.length, keeping: keep.id });
        
        for (const sub of toCancel) {
          try {
            // Cancel in Stripe
            await stripe.subscriptions.cancel(sub.stripe_subscription_id);
            logStep('Cancelled duplicate in Stripe', { id: sub.stripe_subscription_id });
            
            // Update database
            await db.from('subscriptions').update({ status: 'canceled' }).eq('id', sub.id);
            cleanedCount++;
          } catch (err) {
            logStep('Error cancelling duplicate', { id: sub.id, error: err });
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      message: `Cleaned up ${cleanedCount} duplicate subscriptions`,
      cleaned: cleanedCount 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep('ERROR in cleanup-duplicates', { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
