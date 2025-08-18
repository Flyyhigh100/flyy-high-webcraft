import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancellationEmailRequest {
  userEmail: string;
  subscriptionId: string;
  cancelAt: 'period_end' | 'now';
  effectiveDate: Date;
  planType: string;
}

const logStep = (step: string, details?: any) => {
  console.log(`[CANCELLATION-EMAIL] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const {
      userEmail,
      subscriptionId,
      cancelAt,
      effectiveDate,
      planType
    }: CancellationEmailRequest = await req.json();

    logStep("Processing cancellation email", {
      userEmail,
      subscriptionId,
      cancelAt,
      planType
    });

    const isImmediateCancel = cancelAt === 'now';
    const subject = isImmediateCancel ? 'Subscription Cancelled' : 'Subscription Cancellation Scheduled';
    
    const formatDate = (date: Date) => new Date(date).toLocaleDateString();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
          ${subject}
        </h1>
        
        <p>Hello,</p>
        
        <p>We're sorry to see you go. Your ${planType} plan subscription has been ${isImmediateCancel ? 'cancelled immediately' : 'scheduled for cancellation'}.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Cancellation Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Plan:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-transform: capitalize;">${planType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Subscription ID:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${subscriptionId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Effective Date:</strong></td>
              <td style="padding: 8px 0;">${formatDate(effectiveDate)}</td>
            </tr>
          </table>
        </div>
        
        ${isImmediateCancel ? `
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #721c24;">
            <strong>Important:</strong> Your subscription has been cancelled immediately. You will lose access to premium features right away.
          </p>
        </div>
        ` : `
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;">
            <strong>Good News:</strong> You'll continue to have access to your premium features until ${formatDate(effectiveDate)}.
          </p>
        </div>
        `}
        
        <div style="background-color: #e2e3e5; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Want to Come Back?</h3>
          <p style="margin-bottom: 15px;">You can reactivate your subscription anytime before ${formatDate(effectiveDate)} without losing your settings and data.</p>
          <p style="margin: 0;">Simply log in to your account and choose a new plan that fits your needs.</p>
        </div>
        
        <p>If you have any questions or if there's anything we could have done better, please don't hesitate to reach out to our support team.</p>
        
        <p>Thank you for being a valued customer!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Hosting Service <noreply@resend.dev>",
      to: [userEmail],
      subject: subject,
      html: emailHtml,
    });

    logStep("Cancellation email sent successfully", { emailId: emailResponse.data?.id });

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-cancellation-email", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});