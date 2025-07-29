import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MarketingEmailRequest {
  subject: string;
  content: string;
  recipients: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Marketing email function invoked");

    const { subject, content, recipients }: MarketingEmailRequest = await req.json();

    if (!subject || !content || !recipients || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: subject, content, or recipients" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending marketing email to ${recipients.length} recipients`);

    // Create HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">SydeVault</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Professional Website Management</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <div style="white-space: pre-wrap; color: #333; font-size: 16px;">${content}</div>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>You received this email because you're subscribed to SydeVault marketing updates.</p>
              <p style="margin: 10px 0;">
                <a href="#" style="color: #666; text-decoration: underline;">Unsubscribe</a> | 
                <a href="#" style="color: #666; text-decoration: underline;">Update Preferences</a>
              </p>
              <p style="margin: 10px 0 0 0;">© 2024 SydeVault. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const batch of batches) {
      try {
        const emailResponse = await resend.emails.send({
          from: "SydeVault <marketing@resend.dev>",
          to: batch,
          subject: subject,
          html: htmlContent,
        });

        console.log(`Batch sent successfully:`, emailResponse);
        results.push({ batch: batch.length, status: 'success', data: emailResponse });
        successCount += batch.length;
      } catch (batchError) {
        console.error(`Error sending batch:`, batchError);
        results.push({ batch: batch.length, status: 'error', error: batchError.message });
        errorCount += batch.length;
      }

      // Add a small delay between batches to be respectful of rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Marketing email completed. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Marketing email sent successfully`,
        stats: {
          total: recipients.length,
          successful: successCount,
          failed: errorCount
        },
        results: results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-marketing-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);