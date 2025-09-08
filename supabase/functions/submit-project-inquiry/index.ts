import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
};

interface ProjectInquiryRequest {
  name: string;
  email: string;
  phone?: string;
  projectType: string;
  currentWebsite?: string;
  projectDescription: string;
  botField?: string; // honeypot
}

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;

const sanitize = (text: string | undefined | null, max = 2000) =>
  (text ?? "")
    .toString()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, max);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "admin@sydevault.com";

    const {
      name,
      email,
      phone,
      projectType,
      currentWebsite,
      projectDescription,
      botField,
    }: ProjectInquiryRequest = await req.json();

    // Basic validation
    if (!name || !email || !projectType || !projectDescription) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 422, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address" }),
        { status: 422, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } }
      );
    }

    // Honeypot check (simple anti-bot)
    if (botField && botField.trim() !== "") {
      return new Response(JSON.stringify({ success: false, error: "Bot detected" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders },
      });
    }

    // Normalize/sanitize fields
    const clean = {
      name: sanitize(name, 120),
      email: email.toLowerCase().trim(),
      phone: sanitize(phone ?? "", 40),
      projectType: sanitize(projectType, 80),
      currentWebsite: sanitize(currentWebsite ?? "", 200),
      projectDescription: sanitize(projectDescription, 2000),
    };

    // Basic rate limiting per email: 1 request / 60s
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recent, error: recentErr } = await supabase
      .from("project_inquiries")
      .select("id, created_at")
      .eq("email", clean.email)
      .gte("created_at", oneMinuteAgo)
      .limit(1);

    if (recentErr) {
      console.error("Error checking rate limit:", recentErr);
    }

    if (recent && recent.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } }
      );
    }

    console.log("Received project inquiry:", { name: clean.name, email: clean.email, projectType: clean.projectType });

    // Insert inquiry into database
    const { data: inquiry, error: dbError } = await supabase
      .from("project_inquiries")
      .insert([
        {
          name: clean.name,
          email: clean.email,
          phone: clean.phone || null,
          project_type: clean.projectType,
          current_website: clean.currentWebsite || null,
          project_description: clean.projectDescription,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("DB_INSERT_FAILED");
    }

    console.log("Inquiry saved to database:", inquiry.id);

    // Send confirmation email to client
    const clientEmailResponse = await resend.emails.send({
      from: "Syde Vault <onboarding@resend.dev>",
      to: [clean.email],
      subject: "We received your project inquiry!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank you for your interest, ${clean.name}!</h1>
          <p>We've received your project inquiry and are excited to learn more about your needs.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Project Details:</h3>
            <p><strong>Project Type:</strong> ${clean.projectType}</p>
            ${clean.currentWebsite ? `<p><strong>Current Website:</strong> ${clean.currentWebsite}</p>` : ""}
            <p><strong>Description:</strong> ${clean.projectDescription}</p>
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
      to: [ADMIN_EMAIL],
      subject: `New Project Inquiry from ${clean.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Project Inquiry Received</h1>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Client Information:</h3>
            <p><strong>Name:</strong> ${clean.name}</p>
            <p><strong>Email:</strong> ${clean.email}</p>
            ${clean.phone ? `<p><strong>Phone:</strong> ${clean.phone}</p>` : ""}
          </div>
          
          <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Project Details:</h3>
            <p><strong>Project Type:</strong> ${clean.projectType}</p>
            ${clean.currentWebsite ? `<p><strong>Current Website:</strong> ${clean.currentWebsite}</p>` : ""}
            <p><strong>Description:</strong> ${clean.projectDescription}</p>
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
          ...securityHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in submit-project-inquiry function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders },
      }
    );
  }
};

serve(handler);
