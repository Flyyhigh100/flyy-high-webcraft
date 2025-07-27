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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { websiteId, clientEmail } = await req.json()

    if (!websiteId && !clientEmail) {
      return new Response(
        JSON.stringify({ error: 'Either websiteId or clientEmail is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Starting cleanup for:', { websiteId, clientEmail })

    // Step 1: Call the database cleanup function
    const { data: cleanupResult, error: cleanupError } = await supabaseClient
      .rpc('cleanup_client_data', {
        website_id_param: websiteId || null,
        client_email_param: clientEmail || null
      })

    if (cleanupError) {
      console.error('Database cleanup error:', cleanupError)
      return new Response(
        JSON.stringify({ error: cleanupError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Database cleanup result:', cleanupResult)

    // Step 2: Delete auth.users if email provided
    if (clientEmail && cleanupResult.success) {
      try {
        // Find and delete user from auth.users
        const { data: users, error: getUsersError } = await supabaseClient.auth.admin.listUsers()
        
        if (getUsersError) {
          console.error('Error listing users:', getUsersError)
        } else {
          const userToDelete = users.users?.find(user => user.email === clientEmail)
          
          if (userToDelete) {
            const { error: deleteUserError } = await supabaseClient.auth.admin.deleteUser(
              userToDelete.id
            )
            
            if (deleteUserError) {
              console.error('Error deleting auth user:', deleteUserError)
            } else {
              console.log('Successfully deleted auth user:', userToDelete.id)
            }
          }
        }
      } catch (authError) {
        console.error('Auth cleanup error:', authError)
        // Don't fail the entire operation if auth cleanup fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Client data completely cleaned up',
        details: cleanupResult
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})