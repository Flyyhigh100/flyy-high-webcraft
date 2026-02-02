import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-INVITATION-DETAILS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Use service role to securely query client_invitations
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Phase 2: Apply rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    const { data: rateLimitCheck } = await supabaseServiceClient
      .rpc('check_edge_function_rate_limit', {
        ip_addr: clientIp,
        endpoint_name: 'get-invitation-details',
        max_requests: 20,
        window_minutes: 60
      });

    if (!rateLimitCheck) {
      logStep("Rate limit exceeded", { ip: clientIp });
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Rate limit exceeded. Please try again later." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    const { token } = await req.json();
    if (!token) {
      throw new Error("Token is required");
    }

    logStep("Verifying invitation token", { token: token.substring(0, 8) + '...' });

    // Phase 3: Hash the token for secure lookup
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Get invitation using service role - bypassing RLS
    // Phase 3: Query by token hash for security
    // Query by hash only - no plaintext token needed
    const { data: invitation, error } = await supabaseServiceClient
      .from('client_invitations')
      .select('id, email, client_name, website_name, website_url, plan_type, site_id, expires_at')
      .eq('invite_token_hash', tokenHash)
      .eq('status', 'pending')
      .maybeSingle();

    if (error) {
      logStep("Database error", { error: error.message });
      throw new Error("Failed to verify invitation");
    }

    if (!invitation) {
      logStep("Invalid or expired token");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid or expired invitation token" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Check if invitation is expired
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt) {
      logStep("Invitation expired");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invitation has expired" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 410,
      });
    }

    logStep("Valid invitation found", { 
      id: invitation.id, 
      email: invitation.email,
      websiteName: invitation.website_name 
    });

    // Phase 4: Return only necessary invitation details (minimizing sensitive data exposure)
    const sanitizedInvitation = {
      id: invitation.id,
      email: invitation.email,
      client_name: invitation.client_name,
      website_name: invitation.website_name,
      website_url: invitation.website_url,
      plan_type: invitation.plan_type,
      site_id: invitation.site_id,
      expires_at: invitation.expires_at
    };

    return new Response(JSON.stringify({ 
      success: true, 
      invitation: sanitizedInvitation 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});