
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DomainCheckRequest {
  domain: string;
}

interface DomainCheckResponse {
  available: boolean;
  domain: string;
  price?: number;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain }: DomainCheckRequest = await req.json();

    if (!domain) {
      return new Response(
        JSON.stringify({ error: "Domain is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return new Response(
        JSON.stringify({
          available: false,
          domain,
          message: "Invalid domain format"
        } as DomainCheckResponse),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Simulate domain availability check
    // In a real implementation, you would integrate with a domain registrar API
    const unavailableDomains = [
      'google.com',
      'facebook.com',
      'amazon.com',
      'microsoft.com',
      'apple.com'
    ];

    const isAvailable = !unavailableDomains.includes(domain.toLowerCase());
    const price = isAvailable ? 12.99 : undefined;

    const response: DomainCheckResponse = {
      available: isAvailable,
      domain,
      price,
      message: isAvailable ? "Domain is available" : "Domain is not available"
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in domain-check function:", error);
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
