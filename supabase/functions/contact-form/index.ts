
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Zod schema for contact form validation
const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(254, "Email must be less than 254 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message must be less than 5000 characters"),
  company: z.string().trim().max(200, "Company name must be less than 200 characters").optional()
});

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Rate limiting function
const checkRateLimit = async (ipAddress: string, endpoint: string, maxRequests = 3, windowMinutes = 10) => {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  
  // Clean up old entries first
  await supabase.rpc('cleanup_old_rate_limits');
  
  // Check current rate limit
  const { data: existingLimits, error } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('ip_address', ipAddress)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart.toISOString());
    
  if (error) {
    console.error('Rate limit check error:', error);
    return false; // Allow on error to avoid blocking legitimate users
  }
  
  const totalRequests = existingLimits?.reduce((sum, limit) => sum + limit.request_count, 0) || 0;
  
  if (totalRequests >= maxRequests) {
    return false; // Rate limited
  }
  
  // Update or insert rate limit entry
  const { error: upsertError } = await supabase
    .from('rate_limits')
    .upsert({
      ip_address: ipAddress,
      endpoint: endpoint,
      request_count: 1,
      window_start: new Date().toISOString()
    });
    
  if (upsertError) {
    console.error('Rate limit update error:', upsertError);
  }
  
  return true;
};

// Security logging function
const logSecurityEvent = async (eventType: string, ipAddress?: string, userAgent?: string, details?: any, success = true) => {
  const { error } = await supabase
    .from('security_logs')
    .insert({
      event_type: eventType,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: details,
      success: success
    });
    
  if (error) {
    console.error('Security logging error:', error);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP and user agent for logging and rate limiting
    // Parse x-forwarded-for to extract first IP (handles proxy chains)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIP = forwardedFor 
      ? forwardedFor.split(',')[0].trim() 
      : (req.headers.get('x-real-ip') || '127.0.0.1');
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    
    // Rate limiting check - max 3 contact form submissions per 10 minutes per IP
    const rateLimitPassed = await checkRateLimit(clientIP, 'contact-form', 3, 10);
    if (!rateLimitPassed) {
      await logSecurityEvent('contact_form_rate_limited', clientIP, userAgent, {
        endpoint: 'contact-form'
      }, false);
      
      return new Response(JSON.stringify({ 
        error: 'Too many contact form submissions. Please wait 10 minutes before trying again.' 
      }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const requestBody = await req.json();

    // Validate using Zod schema
    let validatedData;
    try {
      validatedData = contactFormSchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        await logSecurityEvent('contact_form_validation_error', clientIP, userAgent, {
          validation_errors: error.errors
        }, false);
        
        return new Response(
          JSON.stringify({ 
            error: "Validation failed", 
            details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
          }),
          {
            status: 422,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      throw error;
    }

    const { name, email, subject, message, company } = validatedData;

    // Content validation (basic spam detection)
    const spamIndicators = ['viagra', 'casino', 'lottery', 'click here', 'free money'];
    const messageContent = `${name} ${email} ${subject} ${message}`.toLowerCase();
    const hasSpamContent = spamIndicators.some(indicator => messageContent.includes(indicator));
    
    if (hasSpamContent) {
      await logSecurityEvent('contact_form_spam_detected', clientIP, userAgent, {
        email: email,
        content_flags: spamIndicators.filter(indicator => messageContent.includes(indicator))
      }, false);
      
      return new Response(
        JSON.stringify({ error: "Message could not be processed" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Contact Form <no-reply@notifications.sydevault.com>",
      to: ["kofi@sydevault.com"],
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7B68EE;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
            <hr style="margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">
              <strong>Technical Details:</strong><br>
              IP: ${clientIP}<br>
              User Agent: ${userAgent}<br>
              Timestamp: ${new Date().toISOString()}
            </p>
          </div>
          <p>This message was sent through the contact form on your website.</p>
        </div>
      `,
    });

    // Send confirmation email to user
    const confirmationEmailResponse = await resend.emails.send({
      from: "SydeVault <no-reply@notifications.sydevault.com>",
      to: [email],
      subject: "Thank you for contacting us!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DAA520;">Thank you for contacting us, ${name}!</h2>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p>Best regards,<br>The SydeVault Team</p>
        </div>
      `,
    });

    // Log successful contact form submission
    await logSecurityEvent('contact_form_submitted', clientIP, userAgent, {
      name: name,
      email: email,
      subject: subject,
      company: company,
      admin_email_sent: !!adminEmailResponse,
      confirmation_email_sent: !!confirmationEmailResponse
    }, true);

    console.log("Contact form emails sent successfully:", {
      admin: adminEmailResponse,
      confirmation: confirmationEmailResponse,
      from: { name, email, subject }
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: "Your message has been sent successfully!"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in contact-form function:", error);
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIP = forwardedFor 
      ? forwardedFor.split(',')[0].trim() 
      : (req.headers.get('x-real-ip') || '127.0.0.1');
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    
    await logSecurityEvent('contact_form_server_error', clientIP, userAgent, {
      error: error.message,
      stack: error.stack
    }, false);
    
    return new Response(
      JSON.stringify({ error: "Failed to send message. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
