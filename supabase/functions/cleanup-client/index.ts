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
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isAdmin, error: adminCheckError } = await supabaseUser.rpc('is_admin', { _user_id: user.id });
    if (adminCheckError || !isAdmin) {
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

    const { websiteId, clientEmail } = await req.json();

    if (!websiteId && !clientEmail) {
      return new Response(
        JSON.stringify({ error: 'Either websiteId or clientEmail is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting cleanup for:', { websiteId, clientEmail });

    // Step 1: Call the database cleanup function
    const { data: cleanupResult, error: cleanupError } = await supabaseAdmin
      .rpc('cleanup_client_data', {
        website_id_param: websiteId || null,
        client_email_param: clientEmail || null
      });

    if (cleanupError) {
      console.error('Database cleanup error:', cleanupError);
      return new Response(
        JSON.stringify({ error: cleanupError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Database cleanup result:', cleanupResult);

    // Step 2: Delete auth.users if email provided
    if (clientEmail && (cleanupResult as any).success) {
      try {
        // Find and delete user from auth.users
        const { data: users, error: getUsersError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (getUsersError) {
          console.error('Error listing users:', getUsersError);
        } else {
          const userToDelete = users.users?.find((u) => u.email === clientEmail);
          
          if (userToDelete) {
            const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(
              userToDelete.id
            );
            
            if (deleteUserError) {
              console.error('Error deleting auth user:', deleteUserError);
            } else {
              console.log('Successfully deleted auth user:', userToDelete.id);
            }
          }
        }
      } catch (authError) {
        console.error('Auth cleanup error:', authError);
        // Don't fail the entire operation if auth cleanup fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Client data completely cleaned up',
        details: cleanupResult
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: (error as any).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});