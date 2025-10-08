import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CLEANUP-ORPHANED] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;

    // Verify admin role
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const body = await req.json();
    const daysThreshold = body.days_threshold || 30; // Default: 30 days
    const dryRun = body.dry_run !== false; // Default: true (don't actually delete)

    logStep("Cleanup parameters", { daysThreshold, dryRun });

    // Find orphaned websites (user_id is NULL and old enough)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

    const { data: orphanedWebsites, error: queryError } = await supabaseClient
      .from('websites')
      .select(`
        id,
        name,
        url,
        created_at,
        client_invitations!client_invitations_site_id_fkey(
          id,
          email,
          status,
          expires_at,
          created_at
        )
      `)
      .is('user_id', null)
      .lt('created_at', cutoffDate.toISOString());

    if (queryError) throw queryError;

    logStep("Found orphaned websites", { count: orphanedWebsites?.length || 0 });

    const results = {
      found: orphanedWebsites?.length || 0,
      cleaned: 0,
      details: [] as any[]
    };

    if (!dryRun && orphanedWebsites && orphanedWebsites.length > 0) {
      for (const website of orphanedWebsites) {
        try {
          // Delete related invitations first
          await supabaseClient
            .from('client_invitations')
            .delete()
            .eq('site_id', website.id);

          // Delete the website
          await supabaseClient
            .from('websites')
            .delete()
            .eq('id', website.id);

          results.cleaned++;
          results.details.push({
            id: website.id,
            name: website.name,
            url: website.url,
            status: 'deleted'
          });

          logStep("Cleaned up orphaned website", { id: website.id, name: website.name });
        } catch (err) {
          logStep("Error cleaning website", { id: website.id, error: err.message });
          results.details.push({
            id: website.id,
            name: website.name,
            url: website.url,
            status: 'error',
            error: err.message
          });
        }
      }
    } else if (orphanedWebsites) {
      // Dry run - just report what would be deleted
      results.details = orphanedWebsites.map(w => ({
        id: w.id,
        name: w.name,
        url: w.url,
        created_at: w.created_at,
        invitation_status: w.client_invitations?.[0]?.status || 'none',
        would_delete: true
      }));
    }

    return new Response(JSON.stringify({
      success: true,
      dry_run: dryRun,
      ...results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
