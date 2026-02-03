import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RESEND-INVITATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) throw new Error('RESEND_API_KEY not configured');

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;

    // Verify admin role
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const body = await req.json();
    const { invitation_id } = body;

    if (!invitation_id) throw new Error('invitation_id required');

    // Get existing invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('client_invitations')
      .select('*')
      .eq('id', invitation_id)
      .single();

    if (inviteError || !invitation) throw new Error('Invitation not found');

    logStep("Found invitation", { id: invitation_id, email: invitation.email });

    // Phase 3: Generate new token, hash it, and set expiry
    const newToken = crypto.randomUUID();
    const encoder = new TextEncoder();
    const data = encoder.encode(newToken);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 7); // 7 days from now

    const inviteUrl = `https://sydevault.com/invite?token=${newToken}&site=${invitation.site_id}`;

    // Update invitation with new token hash and expiry
    // Security: Only store the hash, never the plaintext token
    const { error: updateError } = await supabaseClient
      .from('client_invitations')
      .update({
        invite_token: null, // Plaintext tokens are never stored - only hash is used for lookups
        invite_token_hash: tokenHash,
        expires_at: newExpiry.toISOString(),
        status: 'pending',
        invitation_version: (invitation.invitation_version || 1) + 1
      })
      .eq('id', invitation_id);

    if (updateError) throw updateError;

    logStep("Updated invitation", { newToken, newExpiry });

    // Get email template or use default
    const { data: template } = await supabaseClient
      .from('email_templates')
      .select('*')
      .eq('name', 'client-invitation')
      .maybeSingle();

    let emailHtml = template?.html_content || `
      <h1>Welcome to SydeVault!</h1>
      <p>Hi {{clientName}},</p>
      <p>You've been invited to manage your website: <strong>{{websiteName}}</strong></p>
      <p><strong>Plan:</strong> {{planType}} ({{billingCycle}})</p>
      <p><strong>Amount:</strong> ${{nextPaymentAmount}}</p>
      <p>Click the button below to accept your invitation and set up your account:</p>
      <a href="{{inviteUrl}}" style="display:inline-block;padding:12px 24px;background:#007bff;color:white;text-decoration:none;border-radius:4px;">Accept Invitation</a>
      <p>This invitation expires on {{expiresAt}}.</p>
    `;

    // Replace template variables
    emailHtml = emailHtml
      .replace(/{{clientName}}/g, invitation.client_name)
      .replace(/{{websiteName}}/g, invitation.website_name)
      .replace(/{{websiteUrl}}/g, invitation.website_url)
      .replace(/{{planType}}/g, invitation.plan_type)
      .replace(/{{billingCycle}}/g, 'monthly')
      .replace(/{{nextPaymentAmount}}/g, invitation.next_payment_amount?.toString() || '0')
      .replace(/{{inviteUrl}}/g, inviteUrl)
      .replace(/{{expiresAt}}/g, newExpiry.toLocaleDateString());

    const subject = `Reminder: Your SydeVault Website Invitation - ${invitation.website_name}`;

    // Send email via Resend
    const resend = new Resend(resendApiKey);
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'SydeVault <onboarding@resend.dev>',
      to: [invitation.email],
      subject,
      html: emailHtml,
    });

    if (emailError) throw new Error(`Email send failed: ${emailError.message}`);

    logStep("Email sent", { emailId: emailData?.id });

    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation resent successfully',
      invitation_id: invitation_id,
      new_expiry: newExpiry.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
