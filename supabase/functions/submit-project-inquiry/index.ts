import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ProjectInquiryRequest {
  name: string;
  email: string;
  phone?: string;
  projectType: string;
  currentWebsite?: string;
  projectDescription: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const {
      name,
      email,
      phone,
      projectType,
      currentWebsite,
      projectDescription,
    }: ProjectInquiryRequest = await req.json();

    console.log("Received project inquiry:", { name, email, projectType });

    // Insert inquiry into database
    const { data: inquiry, error: dbError } = await supabase
      .from("project_inquiries")
      .insert([
        {
          name,
          email,
          phone,
          project_type: projectType,
          current_website: currentWebsite,
          project_description: projectDescription,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log("Inquiry saved to database:", inquiry.id);

    // Send confirmation email to client
    const clientEmailResponse = await resend.emails.send({
      from: "Syde Vault <onboarding@resend.dev>",
      to: [email],
      subject: "We received your project inquiry!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank you for your interest, ${name}!</h1>
          <p>We've received your project inquiry and are excited to learn more about your needs.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Project Details:</h3>
            <p><strong>Project Type:</strong> ${projectType}</p>
            ${currentWebsite ? `<p><strong>Current Website:</strong> ${currentWebsite}</p>` : ""}
            <p><strong>Description:</strong> ${projectDescription}</p>
          </div>
          
          <p>Our team will review your inquiry and get back to you within 24 hours with next steps.</p>
          
          <p>Best regards,<br>
          The Syde Vault Team</p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            This email was sent because you submitted a project inquiry at sydevault.com
          </p>
        </div>
      `,
    });

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Syde Vault <onboarding@resend.dev>",
      to: ["admin@sydevault.com"], // Replace with actual admin email
      subject: `New Project Inquiry from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Project Inquiry Received</h1>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Client Information:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
          </div>
          
          <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Project Details:</h3>
            <p><strong>Project Type:</strong> ${projectType}</p>
            ${currentWebsite ? `<p><strong>Current Website:</strong> ${currentWebsite}</p>` : ""}
            <p><strong>Description:</strong> ${projectDescription}</p>
          </div>
          
          <p><a href="https://sydevault.com/admin" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Admin Dashboard</a></p>
          
          <p>Inquiry ID: ${inquiry.id}</p>
        </div>
      `,
    });

    console.log("Emails sent:", { clientEmailResponse, adminEmailResponse });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Project inquiry submitted successfully",
        inquiryId: inquiry.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-project-inquiry function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);