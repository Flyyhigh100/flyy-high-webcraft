import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  userEmail: string;
  changeType: 'upgrade' | 'downgrade' | 'plan_change';
  oldPlan: string;
  newPlan: string;
  billingCycle: string;
  nextBillingAmount: number;
  effectiveDate: string;
  immediateCharge?: number;
}

const logStep = (step: string, details?: any) => {
  console.log(`[PLAN-CHANGE-EMAIL] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const {
      userEmail,
      changeType,
      oldPlan,
      newPlan,
      billingCycle,
      nextBillingAmount,
      effectiveDate,
      immediateCharge
    }: EmailRequest = await req.json();

    logStep("Processing plan change email", {
      userEmail,
      changeType,
      oldPlan,
      newPlan,
      billingCycle
    });

    const subject = `Plan ${changeType === 'upgrade' ? 'Upgrade' : changeType === 'downgrade' ? 'Downgrade' : 'Change'} Confirmation`;
    
    const formatAmount = (amount: number) => (amount / 100).toFixed(2);
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">
          Plan ${changeType === 'upgrade' ? 'Upgrade' : changeType === 'downgrade' ? 'Downgrade' : 'Change'} Confirmation
        </h1>
        
        <p>Hello,</p>
        
        <p>Your hosting plan has been successfully ${changeType === 'upgrade' ? 'upgraded' : changeType === 'downgrade' ? 'downgraded' : 'changed'}.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Plan Change Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Previous Plan:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-transform: capitalize;">${oldPlan}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>New Plan:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-transform: capitalize;">${newPlan}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Billing Cycle:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-transform: capitalize;">${billingCycle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Effective Date:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${formatDate(effectiveDate)}</td>
            </tr>
            ${immediateCharge && immediateCharge > 0 ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Immediate Charge:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">$${formatAmount(immediateCharge)}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0;"><strong>Next Billing Amount:</strong></td>
              <td style="padding: 8px 0;">$${formatAmount(nextBillingAmount)}/${billingCycle === 'yearly' ? 'year' : 'month'}</td>
            </tr>
          </table>
        </div>
        
        ${immediateCharge && immediateCharge > 0 ? `
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>Note:</strong> An immediate charge of $${formatAmount(immediateCharge)} has been applied for the prorated upgrade amount.
          </p>
        </div>
        ` : ''}
        
        <p>You can manage your subscription anytime by visiting your dashboard or contacting our support team.</p>
        
        <p>Thank you for your business!</p>
        
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

    logStep("Email sent successfully", { emailId: emailResponse.data?.id });

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-plan-change-email", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});