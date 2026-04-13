import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (msg: string, details?: any) => {
  console.log(`[SIGNUP-INVITED-USER] ${msg}`, details ? JSON.stringify(details) : "");
};

const BodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid input", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { token: inviteToken, password } = parsed.data;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Hash the token for secure lookup
    const encoder = new TextEncoder();
    const data = encoder.encode(inviteToken);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Fetch invitation
    const { data: invitation, error: invErr } = await supabaseAdmin
      .from("client_invitations")
      .select("*")
      .eq("invite_token_hash", tokenHash)
      .maybeSingle();

    if (invErr) {
      log("DB error fetching invitation", { error: invErr.message });
      return new Response(
        JSON.stringify({ success: false, error: "Failed to process invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!invitation) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid invitation token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (invitation.status !== "pending") {
      return new Response(
        JSON.stringify({ success: false, error: "Invitation is no longer available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (new Date() > new Date(invitation.expires_at)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invitation has expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log("Invitation valid", { email: invitation.email, website: invitation.website_name });

    // Create user with admin API — auto-confirmed, NO Supabase confirmation email
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: invitation.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        client_name: invitation.client_name,
        invited_user: true,
      },
    });

    if (createErr) {
      log("User creation error", { error: createErr.message });
      // If user already exists, try signing them in
      if (createErr.message?.includes("already been registered") || createErr.message?.includes("already exists")) {
        return new Response(
          JSON.stringify({ success: false, error: "An account with this email already exists. Please sign in instead." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create account. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = newUser.user.id;
    log("User created and auto-confirmed", { userId });

    // Link website to user
    if (invitation.site_id) {
      const { error: siteErr } = await supabaseAdmin
        .from("websites")
        .update({ user_id: userId })
        .eq("id", invitation.site_id);

      if (siteErr) {
        log("Website link error", { error: siteErr.message });
      } else {
        log("Website linked to user", { siteId: invitation.site_id });
      }
    }

    // Mark invitation as used
    const { error: updErr } = await supabaseAdmin
      .from("client_invitations")
      .update({ status: "used", used_at: new Date().toISOString() })
      .eq("id", invitation.id);

    if (updErr) {
      log("Invitation update error", { error: updErr.message });
    }

    // Security log
    await supabaseAdmin.from("security_logs").insert({
      user_id: userId,
      event_type: "invitation_accepted",
      success: true,
      details: { invitation_id: invitation.id, site_id: invitation.site_id },
    });

    // Send branded welcome email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "SydeVault <no-reply@notifications.sydevault.com>",
          to: [invitation.email],
          subject: `Welcome to SydeVault - Your account is ready!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #DAA520; text-align: center;">Welcome to SydeVault!</h1>
              
              <p>Hi ${invitation.client_name},</p>
              
              <p>Your account has been successfully created. You can now log in to manage your website hosting.</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0; color: #333;">Your Website:</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${invitation.website_name}</p>
                <p style="margin: 5px 0;"><strong>URL:</strong> <a href="${invitation.website_url}" target="_blank">${invitation.website_url}</a></p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://sydevault.com/login" 
                   style="background: #DAA520; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Log In to Your Dashboard
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                If you have any questions, don't hesitate to reach out to our support team.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="font-size: 12px; color: #999; text-align: center;">
                This email was sent by SydeVault. If you didn't create this account, please contact us immediately.
              </p>
            </div>
          `,
        });
        log("Welcome email sent via Resend");
      } catch (emailErr) {
        log("Welcome email error (non-critical)", { error: emailErr instanceof Error ? emailErr.message : String(emailErr) });
      }
    }

    log("Signup complete, returning success");

    return new Response(
      JSON.stringify({ success: true, userId, siteId: invitation.site_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("Unexpected error", { error: msg });
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
