import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface IntakeFormData {
  fullName: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  businessName: string;
  businessDescription: string;
  industry: string;
  hasExistingWebsite: boolean;
  currentWebsiteUrl: string;
  hasLogo: string;
  hasColorPalette: string;
  brandColors: string;
  hasBrandGuidelines: string;
  hasProfessionalPhotos: string;
  ownsDomain: string;
  domainName: string;
  hasDomainRegistrarAccess: string;
  hasHosting: string;
  needsOngoingHosting: string;
  websiteTypes: string[];
  isNewOrRedesign: string;
  estimatedPages: string;
  requiredFeatures: string[];
  hasContentReady: string;
  needsContentUpdates: string;
  designStyles: string[];
  referenceWebsites: string;
  designDislikes: string;
  budgetRange: string;
  timeline: string;
  deadlineEvent: string;
  competitors: string;
  targetAudience: string;
  websiteGoals: string[];
  referralSource: string;
  additionalNotes: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = "kofi@sydevault.com";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const formData: IntakeFormData = await req.json();

    // Validate required fields
    if (!formData.fullName?.trim() || !formData.email?.trim()) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limit
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { data: rateLimitOk } = await supabase.rpc("check_edge_function_rate_limit", {
      ip_addr: clientIP,
      endpoint_name: "website_intake",
      max_requests: 2,
      window_minutes: 15,
    });

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert into database
    const { data: insertedData, error: insertError } = await supabase
      .from("website_project_intake")
      .insert({
        full_name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || null,
        preferred_contact_method: formData.preferredContactMethod,
        business_name: formData.businessName.trim(),
        business_description: formData.businessDescription.trim(),
        industry: formData.industry,
        has_existing_website: formData.hasExistingWebsite,
        current_website_url: formData.currentWebsiteUrl?.trim() || null,
        has_logo: formData.hasLogo,
        has_color_palette: formData.hasColorPalette,
        brand_colors: formData.brandColors?.trim() || null,
        has_brand_guidelines: formData.hasBrandGuidelines,
        has_professional_photos: formData.hasProfessionalPhotos,
        owns_domain: formData.ownsDomain,
        domain_name: formData.domainName?.trim() || null,
        has_domain_registrar_access: formData.hasDomainRegistrarAccess,
        has_hosting: formData.hasHosting,
        needs_ongoing_hosting: formData.needsOngoingHosting,
        website_types: formData.websiteTypes,
        is_new_or_redesign: formData.isNewOrRedesign,
        estimated_pages: formData.estimatedPages,
        required_features: formData.requiredFeatures,
        has_content_ready: formData.hasContentReady,
        needs_content_updates: formData.needsContentUpdates,
        design_styles: formData.designStyles,
        reference_websites: formData.referenceWebsites?.trim() || null,
        design_dislikes: formData.designDislikes?.trim() || null,
        budget_range: formData.budgetRange,
        timeline: formData.timeline,
        deadline_event: formData.deadlineEvent?.trim() || null,
        competitors: formData.competitors?.trim() || null,
        target_audience: formData.targetAudience.trim(),
        website_goals: formData.websiteGoals,
        referral_source: formData.referralSource || null,
        additional_notes: formData.additionalNotes?.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error("Failed to save submission");
    }

    // Send confirmation emails if Resend is configured
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);

      // Email to admin
      const adminEmailContent = `
        <h1>New Website Project Intake Submission</h1>
        
        <h2>Contact Information</h2>
        <ul>
          <li><strong>Name:</strong> ${formData.fullName}</li>
          <li><strong>Email:</strong> ${formData.email}</li>
          <li><strong>Phone:</strong> ${formData.phone || "Not provided"}</li>
          <li><strong>Preferred Contact:</strong> ${formData.preferredContactMethod}</li>
        </ul>

        <h2>Business Information</h2>
        <ul>
          <li><strong>Business Name:</strong> ${formData.businessName}</li>
          <li><strong>Industry:</strong> ${formData.industry}</li>
          <li><strong>Description:</strong> ${formData.businessDescription}</li>
          <li><strong>Existing Website:</strong> ${formData.hasExistingWebsite ? "Yes" : "No"}</li>
          ${formData.currentWebsiteUrl ? `<li><strong>Current URL:</strong> ${formData.currentWebsiteUrl}</li>` : ""}
        </ul>

        <h2>Branding & Assets</h2>
        <ul>
          <li><strong>Has Logo:</strong> ${formData.hasLogo}</li>
          <li><strong>Color Palette:</strong> ${formData.hasColorPalette}</li>
          ${formData.brandColors ? `<li><strong>Brand Colors:</strong> ${formData.brandColors}</li>` : ""}
          <li><strong>Brand Guidelines:</strong> ${formData.hasBrandGuidelines}</li>
          <li><strong>Professional Photos:</strong> ${formData.hasProfessionalPhotos}</li>
        </ul>

        <h2>Domain & Hosting</h2>
        <ul>
          <li><strong>Owns Domain:</strong> ${formData.ownsDomain}</li>
          ${formData.domainName ? `<li><strong>Domain Name:</strong> ${formData.domainName}</li>` : ""}
          <li><strong>Registrar Access:</strong> ${formData.hasDomainRegistrarAccess}</li>
          <li><strong>Has Hosting:</strong> ${formData.hasHosting}</li>
          <li><strong>Ongoing Hosting Needed:</strong> ${formData.needsOngoingHosting}</li>
        </ul>

        <h2>Website Requirements</h2>
        <ul>
          <li><strong>Website Types:</strong> ${formData.websiteTypes.join(", ")}</li>
          <li><strong>New/Redesign:</strong> ${formData.isNewOrRedesign}</li>
          <li><strong>Estimated Pages:</strong> ${formData.estimatedPages}</li>
          <li><strong>Required Features:</strong> ${formData.requiredFeatures.join(", ")}</li>
          <li><strong>Content Ready:</strong> ${formData.hasContentReady}</li>
          <li><strong>Content Updates:</strong> ${formData.needsContentUpdates}</li>
        </ul>

        <h2>Design Preferences</h2>
        <ul>
          <li><strong>Design Styles:</strong> ${formData.designStyles.join(", ")}</li>
          ${formData.referenceWebsites ? `<li><strong>Reference Websites:</strong> ${formData.referenceWebsites}</li>` : ""}
          ${formData.designDislikes ? `<li><strong>Dislikes:</strong> ${formData.designDislikes}</li>` : ""}
        </ul>

        <h2>Budget & Timeline</h2>
        <ul>
          <li><strong>Budget Range:</strong> ${formData.budgetRange}</li>
          <li><strong>Timeline:</strong> ${formData.timeline}</li>
          ${formData.deadlineEvent ? `<li><strong>Deadline Event:</strong> ${formData.deadlineEvent}</li>` : ""}
        </ul>

        <h2>Additional Information</h2>
        <ul>
          ${formData.competitors ? `<li><strong>Competitors:</strong> ${formData.competitors}</li>` : ""}
          <li><strong>Target Audience:</strong> ${formData.targetAudience}</li>
          <li><strong>Website Goals:</strong> ${formData.websiteGoals.join(", ")}</li>
          ${formData.referralSource ? `<li><strong>Referral Source:</strong> ${formData.referralSource}</li>` : ""}
          ${formData.additionalNotes ? `<li><strong>Additional Notes:</strong> ${formData.additionalNotes}</li>` : ""}
        </ul>
      `;

      try {
        await resend.emails.send({
          from: "Intake Form <no-reply@notifications.sydevault.com>",
          to: [adminEmail],
          subject: `New Project Intake: ${formData.businessName}`,
          html: adminEmailContent,
        });

        // Confirmation email to client
        const clientEmailContent = `
          <h1>Thank You for Your Submission!</h1>
          <p>Hi ${formData.fullName},</p>
          <p>We've received your website project intake form and are excited to learn more about your project for <strong>${formData.businessName}</strong>.</p>
          
          <p>Here's a quick summary of what you submitted:</p>
          <ul>
            <li><strong>Business:</strong> ${formData.businessName}</li>
            <li><strong>Website Type:</strong> ${formData.websiteTypes.join(", ")}</li>
            <li><strong>Budget Range:</strong> ${formData.budgetRange}</li>
            <li><strong>Timeline:</strong> ${formData.timeline}</li>
          </ul>

          <p>We typically respond within 24-48 hours. In the meantime, feel free to reach out if you have any questions.</p>
          
          <p>Best regards,<br>The SydeVault Team</p>
        `;

        await resend.emails.send({
          from: "SydeVault <no-reply@notifications.sydevault.com>",
          to: [formData.email],
          subject: "We've Received Your Project Details - SydeVault",
          html: clientEmailContent,
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        // Don't fail the whole request if email fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, id: insertedData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in submit-website-intake:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
