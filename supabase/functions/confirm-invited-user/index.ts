import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[CONFIRM-USER] Function started');

    // Authenticate and authorize requester (must be admin)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Client for user auth verification
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !user) {
      console.error('[CONFIRM-USER] Invalid auth token:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin via RPC (SECURITY DEFINER)
    const { data: isAdmin, error: adminCheckError } = await supabaseUser.rpc('is_admin', { _user_id: user.id });
    if (adminCheckError || !isAdmin) {
      console.warn('[CONFIRM-USER] Admin check failed:', adminCheckError);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Service role client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { userId } = await req.json()
    console.log('[CONFIRM-USER] Processing user ID:', userId);

    if (!userId) {
      console.log('[CONFIRM-USER] Error: No user ID provided');
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Confirm the user's email using the service role
    console.log('[CONFIRM-USER] Attempting to confirm email for user:', userId);
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        email_confirmed_at: new Date().toISOString(),
        email_confirm: true
      }
    )

    if (error) {
      console.error('[CONFIRM-USER] Error confirming user:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('[CONFIRM-USER] Successfully confirmed user email');
    return new Response(
      JSON.stringify({ success: true, user: data.user }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('[CONFIRM-USER] Function error:', error)
    return new Response(
      JSON.stringify({ error: (error as any).message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})