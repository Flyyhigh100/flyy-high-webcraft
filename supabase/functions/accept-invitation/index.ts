import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (msg: string, details?: any) => {
  console.log(`[ACCEPT-INVITATION] ${msg}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate requester (must be logged in)
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Missing authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const token = authHeader.replace("Bearer ", "");

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: userResp, error: userErr } = await supabaseUser.auth.getUser(token);
    if (userErr || !userResp?.user) {
      log("Auth failed", { error: userErr?.message });
      return new Response(JSON.stringify({ success: false, error: "Invalid authentication token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const user = userResp.user;

    const { token: inviteToken } = await req.json();
    if (!inviteToken) {
      return new Response(JSON.stringify({ success: false, error: "Token is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch invitation securely
    const { data: invitation, error: invErr } = await supabaseAdmin
      .from('client_invitations')
      .select('*')
      .eq('invite_token', inviteToken)
      .maybeSingle();

    if (invErr) {
      log("DB error fetching invitation", { error: invErr.message });
      return new Response(JSON.stringify({ success: false, error: "Failed to process invitation" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!invitation) {
      return new Response(JSON.stringify({ success: false, error: "Invalid invitation token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (invitation.status !== 'pending') {
      return new Response(JSON.stringify({ success: false, error: "Invitation is not available" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check expiry
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt) {
      return new Response(JSON.stringify({ success: false, error: "Invitation has expired" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 410,
      });
    }

    // Verify the authenticated user email matches invitation email
    if ((user.email || '').toLowerCase() !== (invitation.email || '').toLowerCase()) {
      return new Response(JSON.stringify({ success: false, error: "Authenticated user does not match invitation" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Link website to user if applicable
    if (invitation.site_id) {
      const { error: siteErr } = await supabaseAdmin
        .from('websites')
        .update({ user_id: user.id })
        .eq('id', invitation.site_id);

      if (siteErr) {
        log("Website link error", { error: siteErr.message });
      }
    }

    // Auto-confirm the user's email (eliminates Supabase confirmation email)
    const { error: confirmErr } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { 
        email_confirm: true
      }
    );

    if (confirmErr) {
      log("Email confirmation error", { error: confirmErr.message });
      // Non-critical error, continue with invitation acceptance
    } else {
      log("User email auto-confirmed", { user_id: user.id });
    }

    // Mark invitation as used
    const { error: updErr } = await supabaseAdmin
      .from('client_invitations')
      .update({ status: 'used', used_at: new Date().toISOString() })
      .eq('id', invitation.id);

    if (updErr) {
      log("Invitation update error", { error: updErr.message });
      return new Response(JSON.stringify({ success: false, error: "Failed to update invitation" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Security log
    await supabaseAdmin.from('security_logs').insert({
      user_id: user.id,
      event_type: 'invitation_accepted',
      success: true,
      details: { invitation_id: invitation.id, site_id: invitation.site_id }
    });

    return new Response(JSON.stringify({ success: true, site_id: invitation.site_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("Unexpected error", { error: msg });
    return new Response(JSON.stringify({ success: false, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});