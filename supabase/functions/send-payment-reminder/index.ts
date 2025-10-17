
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentReminderRequest {
  siteId: string;
  reminderType: '3_day' | '7_day' | '14_day' | '30_day' | 'final_notice' | 'upcoming_7d' | 'upcoming_3d' | 'upcoming_1d';
  manualSend?: boolean;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const getEmailTemplate = (reminderType: string, siteName: string, siteUrl: string, daysOverdue: number, amount: number) => {
  const baseTemplate = {
    from: "SydeVault Billing <billing@sydevault.com>",
    subject: "",
    html: ""
  };

  switch (reminderType) {
    case '3_day':
      baseTemplate.subject = `Payment Reminder: ${siteName} - 3 Days Overdue`;
      baseTemplate.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DAA520;">Payment Reminder - 3 Days Overdue</h2>
          <p>Dear Client,</p>
          <p>This is a friendly reminder that your payment for <strong>${siteName}</strong> is now 3 days overdue.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Website:</strong> ${siteName}</p>
            <p><strong>URL:</strong> <a href="${siteUrl}">${siteUrl}</a></p>
            <p><strong>Amount Due:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
          </div>
          <p>Please make your payment as soon as possible to avoid any service interruption.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>The SydeVault Team</p>
        </div>
      `;
      break;

    case '7_day':
      baseTemplate.subject = `Urgent: Payment Required - ${siteName} - 7 Days Overdue`;
      baseTemplate.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Urgent Payment Required - 7 Days Overdue</h2>
          <p>Dear Client,</p>
          <p>Your payment for <strong>${siteName}</strong> is now 7 days overdue. Immediate action is required.</p>
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p><strong>Website:</strong> ${siteName}</p>
            <p><strong>URL:</strong> <a href="${siteUrl}">${siteUrl}</a></p>
            <p><strong>Amount Due:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
          </div>
          <p><strong>Action Required:</strong> Please make your payment immediately to avoid service suspension.</p>
          <p>If payment is not received within 7 days, your website may be temporarily suspended.</p>
          <p>If you're experiencing difficulties, please contact us immediately to discuss payment arrangements.</p>
          <p>Best regards,<br>The SydeVault Team</p>
        </div>
      `;
      break;

    case '14_day':
      baseTemplate.subject = `Final Notice: ${siteName} - 14 Days Overdue - Service Suspension Imminent`;
      baseTemplate.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Final Notice - Service Suspension Imminent</h2>
          <p>Dear Client,</p>
          <p>This is your final notice. Your payment for <strong>${siteName}</strong> is now 14 days overdue.</p>
          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Website:</strong> ${siteName}</p>
            <p><strong>URL:</strong> <a href="${siteUrl}">${siteUrl}</a></p>
            <p><strong>Amount Due:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
          </div>
          <p><strong>URGENT:</strong> If payment is not received within 16 days (2 days from now), your website will be suspended.</p>
          <p>During suspension, your website will display a maintenance page until payment is received.</p>
          <p>To avoid suspension, please make your payment immediately or contact us to arrange a payment plan.</p>
          <p>Best regards,<br>The SydeVault Team</p>
        </div>
      `;
      break;

    case '30_day':
      baseTemplate.subject = `Website Suspended: ${siteName} - Payment Required for Reactivation`;
      baseTemplate.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Website Suspended - Payment Required</h2>
          <p>Dear Client,</p>
          <p>Your website <strong>${siteName}</strong> has been suspended due to non-payment.</p>
          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Website:</strong> ${siteName}</p>
            <p><strong>URL:</strong> <a href="${siteUrl}">${siteUrl}</a></p>
            <p><strong>Amount Due:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
            <p><strong>Status:</strong> SUSPENDED</p>
          </div>
          <p>Your website is currently displaying a maintenance page. To reactivate your service:</p>
          <ol>
            <li>Make the outstanding payment immediately</li>
            <li>Contact us to confirm payment and request reactivation</li>
          </ol>
          <p>We want to restore your service as quickly as possible. Please contact us immediately.</p>
          <p>Best regards,<br>The SydeVault Team</p>
        </div>
      `;
      break;

    case 'final_notice':
      baseTemplate.subject = `Final Notice: ${siteName} - Account Termination Pending`;
      baseTemplate.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #991b1b;">Final Notice - Account Termination Pending</h2>
          <p>Dear Client,</p>
          <p>This is your final notice before account termination for <strong>${siteName}</strong>.</p>
          <div style="background: #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #991b1b;">
            <p><strong>Website:</strong> ${siteName}</p>
            <p><strong>URL:</strong> <a href="${siteUrl}">${siteUrl}</a></p>
            <p><strong>Amount Due:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
            <p><strong>Status:</strong> PENDING TERMINATION</p>
          </div>
          <p><strong>FINAL WARNING:</strong> If payment is not received within 7 days, your account will be terminated and all data will be permanently deleted.</p>
          <p>This is your last opportunity to save your website and data. Please contact us immediately.</p>
          <p>Best regards,<br>The SydeVault Team</p>
        </div>
      `;
      break;

    case 'upcoming_7d': {
      const daysUntilDue = Math.max(1, -daysOverdue);
      baseTemplate.subject = `Upcoming Payment: ${siteName} due in ${daysUntilDue} days`;
      baseTemplate.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Friendly Reminder: Payment due in ${daysUntilDue} days</h2>
          <p>Hi there,</p>
          <p>This is a friendly reminder that your subscription for <strong>${siteName}</strong> is due in <strong>${daysUntilDue} days</strong>.</p>
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #60a5fa;">
            <p><strong>Website:</strong> ${siteName}</p>
            <p><strong>URL:</strong> <a href="${siteUrl}">${siteUrl}</a></p>
            <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          </div>
          <p>No action is required yet, we just wanted to give you a heads-up.</p>
          <p>Best regards,<br>The SydeVault Team</p>
        </div>
      `;
      break;
    }

    case 'upcoming_3d': {
      const daysUntilDue = Math.max(1, -daysOverdue);
      baseTemplate.subject = `Reminder: ${siteName} payment due in ${daysUntilDue} days`;
      baseTemplate.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1d4ed8;">Reminder: Payment due soon</h2>
          <p>Hi there,</p>
          <p>Your payment for <strong>${siteName}</strong> is due in <strong>${daysUntilDue} days</strong>.</p>
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p><strong>Website:</strong> ${siteName}</p>
            <p><strong>URL:</strong> <a href="${siteUrl}">${siteUrl}</a></p>
            <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          </div>
          <p>If you need to update billing details, please do so before the due date.</p>
          <p>Best regards,<br>The SydeVault Team</p>
        </div>
      `;
      break;
    }

    case 'upcoming_1d': {
      const daysUntilDue = Math.max(1, -daysOverdue);
      baseTemplate.subject = `Action needed: ${siteName} payment due tomorrow`;
      baseTemplate.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f766e;">Payment due tomorrow</h2>
          <p>Hi there,</p>
          <p>This is a reminder that your payment for <strong>${siteName}</strong> is due <strong>tomorrow</strong>.</p>
          <div style="background: #ccfbf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #14b8a6;">
            <p><strong>Website:</strong> ${siteName}</p>
            <p><strong>URL:</strong> <a href="${siteUrl}">${siteUrl}</a></p>
            <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          </div>
          <p>To ensure uninterrupted service, please make sure your payment method is up to date.</p>
          <p>Best regards,<br>The SydeVault Team</p>
        </div>
      `;
      break;
    }
  }

  return baseTemplate;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { siteId, reminderType, manualSend = false }: PaymentReminderRequest = await req.json();

    // Get website details
    const { data: website, error: websiteError } = await supabaseClient
      .from('websites')
      .select('*, profiles!websites_user_id_fkey(email)')
      .eq('id', siteId)
      .single();

    if (websiteError || !website) {
      throw new Error(`Website not found: ${websiteError?.message}`);
    }

    // Calculate days overdue
    const nextPaymentDate = new Date(website.next_payment_date);
    const today = new Date();
    const daysOverdue = Math.floor((today.getTime() - nextPaymentDate.getTime()) / (1000 * 60 * 60 * 24));

    // Get email template
    const emailTemplate = getEmailTemplate(
      reminderType, 
      website.name, 
      website.url, 
      daysOverdue, 
      website.next_payment_amount || 0
    );

    // Send email
    const emailResponse = await resend.emails.send({
      from: emailTemplate.from,
      to: [website.profiles.email],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log("Email sent successfully:", emailResponse);

    // Record the reminder in the database
    const { error: reminderError } = await supabaseClient
      .from('payment_reminders')
      .insert({
        site_id: siteId,
        reminder_type: reminderType,
        email_status: 'sent',
        amount_due: website.next_payment_amount
      });

    if (reminderError) {
      console.error("Error recording reminder:", reminderError);
    }

    // Update last reminder sent timestamp
    await supabaseClient
      .from('websites')
      .update({ last_payment_reminder_sent: new Date().toISOString() })
      .eq('id', siteId);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: `${reminderType} reminder sent successfully`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-payment-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
