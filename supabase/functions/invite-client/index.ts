import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[INVITE-CLIENT] ${step}${detailsStr}`);
};

interface InviteClientRequest {
  email: string;
  clientName: string;
  websiteName: string;
  websiteUrl: string;
  planType: string;
  billingCycle?: 'monthly' | 'yearly';
  nextPaymentAmount?: number;
  siteId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

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
    if (!user) throw new Error("User not authenticated");

    // Verify user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      throw new Error("Unauthorized: Admin access required");
    }

    const { email, clientName, websiteName, websiteUrl, planType, billingCycle, nextPaymentAmount, siteId }: InviteClientRequest = await req.json();
    logStep("Processing invite request", { email, clientName, websiteName, billingCycle, nextPaymentAmount });

    // Generate invitation token
    const inviteToken = crypto.randomUUID();
    const inviteUrl = `https://sydevault.com/invite?token=${inviteToken}&site=${siteId}`;

    // Check for existing pending invitations and supersede them
    logStep("Checking for existing invitations", { email, websiteName, websiteUrl });
    const { data: existingInvitations, error: checkError } = await supabaseClient
      .from('client_invitations')
      .select('id, invitation_version')
      .eq('email', email)
      .in('status', ['pending'])
      .or(`website_name.eq.${websiteName},website_url.eq.${websiteUrl}`);

    let newVersion = 1;
    if (checkError) {
      console.error('Error checking existing invitations:', checkError);
    } else if (existingInvitations && existingInvitations.length > 0) {
      // Calculate next version number
      const maxVersion = Math.max(...existingInvitations.map(inv => inv.invitation_version || 1));
      newVersion = maxVersion + 1;
      
      // Mark existing pending invitations as superseded instead of deleting them
      logStep("Superseding existing pending invitations", { count: existingInvitations.length, newVersion });
      const { error: supersededError } = await supabaseClient
        .from('client_invitations')
        .update({
          status: 'superseded',
          superseded_at: new Date().toISOString(),
          superseded_by: user.id
        })
        .in('id', existingInvitations.map(inv => inv.id));
      
      if (supersededError) {
        console.error('Error superseding existing invitations:', supersededError);
      }
    }

    // Get admin profile name for tracking
    const { data: adminProfile } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('user_id', user.id)
      .single();

    // Store invitation in database with payment details and tracking info
    const { error: inviteError } = await supabaseClient
      .from('client_invitations')
      .insert({
        email,
        client_name: clientName,
        website_name: websiteName,
        website_url: websiteUrl,
        plan_type: planType,
        next_payment_amount: nextPaymentAmount,
        site_id: siteId,
        invite_token: inviteToken,
        invited_by: user.id,
        invitation_version: newVersion,
        created_by_name: adminProfile?.email || 'Admin',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });

    if (inviteError) throw new Error(`Failed to create invitation: ${inviteError.message}`);

    // Get email template from database
    const { data: template, error: templateError } = await supabaseClient
      .from('email_templates')
      .select('subject, html_content')
      .eq('name', 'client_invitation')
      .single();

    // Format plan with pricing
    const getPlanDisplayText = (plan: string, amount: number, cycle: string = 'monthly') => {
      const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
      if (cycle === 'yearly') {
        const perMonth = amount / 12;
        return `${planName} - $${amount?.toFixed(2) || '0.00'}/year ($${perMonth.toFixed(0)}/month equivalent)`;
      }
      return `${planName} - $${amount?.toFixed(2) || '0.00'}/month`;
    };

    let emailSubject = `You're invited to join SydeVault - ${websiteName}`;
    let emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #DAA520; text-align: center;">Welcome to SydeVault</h1>
        
        <p>Dear ${clientName},</p>
        
        <p>You've been invited to join SydeVault's hosting platform to manage your website:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #333;">Website Details:</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${websiteName}</p>
          <p style="margin: 5px 0;"><strong>URL:</strong> <a href="${websiteUrl}" target="_blank">${websiteUrl}</a></p>
          <p style="margin: 5px 0;"><strong>Plan:</strong> ${getPlanDisplayText(planType, nextPaymentAmount || 0, billingCycle || 'monthly')}</p>
        </div>
        
        <p>By creating your account, you'll be able to:</p>
        <ul>
          <li>View and pay your monthly hosting bills</li>
          <li>Access your website analytics and performance data</li>
          <li>Submit support tickets and get personalized support</li>
          <li>Manage your account settings and billing information</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" 
             style="background: #DAA520; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Create Your Account
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          This invitation will expire in 7 days. If you have any questions, please don't hesitate to contact us at SydeVault.
        </p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 12px; color: #6c757d;">
          <p style="margin: 5px 0;"><strong>Latest Invitation</strong> - Version ${newVersion}</p>
          <p style="margin: 5px 0;">Sent: ${new Date().toLocaleString()}</p>
          <p style="margin: 5px 0;">Please use this invitation link instead of any previous ones.</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          This email was sent by SydeVault. If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `;

    // Use template if available
    if (template && !templateError) {
      logStep("Using database email template");
      emailSubject = template.subject.replace('{{websiteName}}', websiteName);
      emailHtml = template.html_content
        .replace(/\{\{clientName\}\}/g, clientName)
        .replace(/\{\{websiteName\}\}/g, websiteName)
        .replace(/\{\{websiteUrl\}\}/g, websiteUrl)
        .replace(/\{\{planType\}\}/g, planType)
        .replace(/\{\{planDisplay\}\}/g, getPlanDisplayText(planType, nextPaymentAmount || 0, billingCycle || 'monthly'))
        .replace(/\{\{inviteUrl\}\}/g, inviteUrl);
    } else {
      logStep("Using fallback email template", { templateError: templateError?.message });
    }

    const resend = new Resend(resendKey);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "SydeVault <no-reply@notifications.sydevault.com>",
      to: [email],
      subject: emailSubject,
      html: emailHtml,
    });

    if (emailError) {
      logStep("Resend error details", { emailError });
      throw new Error(`Failed to send email: ${JSON.stringify(emailError)}`);
    }

    logStep("Invitation sent successfully", { emailId: emailData?.id, inviteToken });

    return new Response(JSON.stringify({ 
      success: true, 
      inviteToken,
      inviteUrl,
      emailId: emailData?.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in invite-client", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});