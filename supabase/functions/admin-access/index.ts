import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { timingSafeEqual } from "https://deno.land/std@0.190.0/crypto/timing_safe_equal.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminAccessRequest {
  accessKey: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Rate limiting function
const checkRateLimit = async (ipAddress: string, endpoint: string, maxRequests = 5, windowMinutes = 15) => {
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
const logSecurityEvent = async (eventType: string, userId?: string, ipAddress?: string, userAgent?: string, details?: any, success = true) => {
  const { error } = await supabase
    .from('security_logs')
    .insert({
      event_type: eventType,
      user_id: userId,
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP and user agent for logging
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    
    // Rate limiting check - max 5 attempts per 15 minutes per IP
    const rateLimitPassed = await checkRateLimit(clientIP, 'admin-access', 5, 15);
    if (!rateLimitPassed) {
      await logSecurityEvent('admin_access_rate_limited', undefined, clientIP, userAgent, {
        endpoint: 'admin-access'
      }, false);
      
      return new Response(JSON.stringify({ 
        error: 'Too many attempts. Please try again in 15 minutes.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the authorization header and verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      await logSecurityEvent('admin_access_unauthorized', undefined, clientIP, userAgent, {
        error: 'No authorization header'
      }, false);
      
      return new Response(JSON.stringify({ 
        error: 'Unauthorized - please log in first' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the user from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      await logSecurityEvent('admin_access_invalid_token', undefined, clientIP, userAgent, {
        error: userError?.message
      }, false);
      
      return new Response(JSON.stringify({ 
        error: 'Invalid authentication token' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { accessKey }: AdminAccessRequest = await req.json();

    // Validate required fields
    if (!accessKey) {
      await logSecurityEvent('admin_access_missing_key', user.id, clientIP, userAgent, {
        email: user.email
      }, false);
      
      return new Response(JSON.stringify({ 
        error: 'Access key is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the secure admin access key from environment
    const ADMIN_ACCESS_KEY = Deno.env.get('ADMIN_ACCESS_KEY');
    if (!ADMIN_ACCESS_KEY) {
      console.error('ADMIN_ACCESS_KEY environment variable not set');
      await logSecurityEvent('admin_access_config_error', user.id, clientIP, userAgent, {
        error: 'Server configuration error'
      }, false);
      
      return new Response(JSON.stringify({ 
        error: 'Server configuration error. Please contact support.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the access key using constant-time comparison to prevent timing attacks
    const encoder = new TextEncoder();
    const accessKeyBytes = encoder.encode(accessKey);
    const adminKeyBytes = encoder.encode(ADMIN_ACCESS_KEY);
    
    // Check lengths first (this doesn't leak information about the key itself)
    if (accessKeyBytes.length !== adminKeyBytes.length) {
      await logSecurityEvent('admin_access_invalid_key', user.id, clientIP, userAgent, {
        email: user.email,
        attempted_key_length: accessKey.length
      }, false);
      
      return new Response(JSON.stringify({ 
        error: 'Invalid access key. Please try again.' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Constant-time comparison to prevent timing attacks
    if (!timingSafeEqual(accessKeyBytes, adminKeyBytes)) {
      await logSecurityEvent('admin_access_invalid_key', user.id, clientIP, userAgent, {
        email: user.email,
        attempted_key_length: accessKey.length
      }, false);
      
      return new Response(JSON.stringify({ 
        error: 'Invalid access key. Please try again.' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Make sure the profiles table exists
    await supabase.rpc('create_profiles_if_not_exists');

    // Ensure user profile exists
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        user_id: user.id
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      await logSecurityEvent('admin_access_db_error', user.id, clientIP, userAgent, {
        email: user.email,
        error: profileError.message
      }, false);
      
      return new Response(JSON.stringify({ 
        error: 'Error creating profile. Please contact support.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert admin role into user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: 'admin'
      })
      .select()
      .single();

    if (roleError) {
      console.error('Role assignment error:', roleError);
      await logSecurityEvent('admin_access_db_error', user.id, clientIP, userAgent, {
        email: user.email,
        error: roleError.message
      }, false);
      
      return new Response(JSON.stringify({ 
        error: 'Error assigning admin role. Please contact support.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log successful admin access grant
    await logSecurityEvent('admin_access_granted', user.id, clientIP, userAgent, {
      email: user.email,
      granted_at: new Date().toISOString()
    }, true);

    console.log(`Admin access granted to user: ${user.email} (${user.id})`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Admin access granted successfully!'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in admin-access function:', error);
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    
    await logSecurityEvent('admin_access_server_error', undefined, clientIP, userAgent, {
      error: error.message,
      stack: error.stack
    }, false);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);