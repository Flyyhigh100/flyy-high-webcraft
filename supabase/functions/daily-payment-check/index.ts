
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting daily payment check...");

    // First, update all payment statuses
    const { error: updateError } = await supabaseClient.rpc('update_payment_statuses');
    
    if (updateError) {
      console.error("Error updating payment statuses:", updateError);
      throw updateError;
    }

    // Get websites that need reminders
    const today = new Date();
    const { data: overdueWebsites, error: fetchError } = await supabaseClient
      .from('websites')
      .select('*')
      .in('payment_status', ['overdue_3d', 'overdue_7d', 'overdue_14d', 'overdue_30d'])
      .not('next_payment_date', 'is', null);

    if (fetchError) {
      console.error("Error fetching overdue websites:", fetchError);
      throw fetchError;
    }

    // Fetch user emails from auth
    const { data: authData } = await supabaseClient.auth.admin.listUsers();
    const emailMap = new Map<string, string>();
    if (authData?.users) {
      authData.users.forEach((user: any) => {
        if (user.id && user.email) {
          emailMap.set(user.id, user.email);
        }
      });
    }

    // Merge email data with websites
    const overdueWebsitesWithEmails = (overdueWebsites || []).map(website => ({
      ...website,
      email: emailMap.get(website.user_id)
    }));

    console.log(`Found ${overdueWebsitesWithEmails.length} overdue websites`);

    const results = [];

    // Process overdue websites
    for (const website of overdueWebsitesWithEmails) {
      const nextPaymentDate = new Date(website.next_payment_date);
      const daysOverdue = Math.floor((today.getTime() - nextPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if we should send a reminder based on payment status and last reminder sent
      let shouldSendReminder = false;
      let reminderType = '';
      
      const lastReminderDate = website.last_payment_reminder_sent ? 
        new Date(website.last_payment_reminder_sent) : null;
      const daysSinceLastReminder = lastReminderDate ? 
        Math.floor((today.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;

      switch (website.payment_status) {
        case 'overdue_3d':
          if (!lastReminderDate || daysSinceLastReminder >= 1) {
            shouldSendReminder = true;
            reminderType = '3_day';
          }
          break;
        case 'overdue_7d':
          if (!lastReminderDate || daysSinceLastReminder >= 2) {
            shouldSendReminder = true;
            reminderType = '7_day';
          }
          break;
        case 'overdue_14d':
          if (!lastReminderDate || daysSinceLastReminder >= 3) {
            shouldSendReminder = true;
            reminderType = '14_day';
          }
          break;
        case 'overdue_30d':
          if (!lastReminderDate || daysSinceLastReminder >= 7) {
            shouldSendReminder = true;
            reminderType = '30_day';
          }
          break;
      }

      if (shouldSendReminder && reminderType) {
        try {
          // Call the send-payment-reminder function using the Supabase client
          const { data: reminderResult, error: invokeError } = await supabaseClient.functions.invoke('send-payment-reminder', {
            body: {
              siteId: website.id,
              reminderType,
              manualSend: false,
            }
          });

          if (invokeError) throw invokeError;

          results.push({
            websiteId: website.id,
            websiteName: website.name,
            reminderType,
            success: true,
            message: reminderResult?.message || 'Sent',
          });

          console.log(`Sent ${reminderType} reminder for ${website.name}`);
          
        } catch (error: any) {
          console.error(`Error sending reminder for ${website.name}:`, error);
          results.push({
            websiteId: website.id,
            websiteName: website.name,
            reminderType,
            success: false,
            message: error.message,
          });
        }
      }
    }

    // Additionally, process upcoming payments (1, 3, and 7 days before due date)
    const { data: upcomingWebsites, error: upcomingError } = await supabaseClient
      .from('websites')
      .select('*')
      .eq('payment_status', 'current')
      .not('next_payment_date', 'is', null);

    if (upcomingError) {
      console.error('Error fetching upcoming websites:', upcomingError);
      throw upcomingError;
    }

    // Merge email data with upcoming websites
    const upcomingWebsitesWithEmails = (upcomingWebsites || []).map(website => ({
      ...website,
      email: emailMap.get(website.user_id)
    }));

    for (const website of upcomingWebsitesWithEmails) {
      const nextPaymentDate = new Date(website.next_payment_date);
      const daysUntilDue = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (![1, 3, 7].includes(daysUntilDue)) continue;

      const lastReminderDate = website.last_payment_reminder_sent ? new Date(website.last_payment_reminder_sent) : null;
      const sentToday = lastReminderDate && lastReminderDate.toDateString() === today.toDateString();
      if (sentToday) continue; // avoid duplicate sends on the same day

      const reminderType = daysUntilDue === 1 ? 'upcoming_1d' : daysUntilDue === 3 ? 'upcoming_3d' : 'upcoming_7d';

      try {
        const { data: reminderResult, error: invokeError } = await supabaseClient.functions.invoke('send-payment-reminder', {
          body: {
            siteId: website.id,
            reminderType,
            manualSend: false,
          }
        });

        if (invokeError) throw invokeError;

        results.push({
          websiteId: website.id,
          websiteName: website.name,
          reminderType,
          success: true,
          message: reminderResult?.message || 'Sent',
        });

        console.log(`Sent ${reminderType} reminder for ${website.name}`);
      } catch (error: any) {
        console.error(`Error sending upcoming reminder for ${website.name}:`, error);
        results.push({
          websiteId: website.id,
          websiteName: website.name,
          reminderType,
          success: false,
          message: error.message,
        });
      }
    }

    console.log("Daily payment check completed");

    return new Response(JSON.stringify({ 
      success: true,
      checkedWebsites: overdueWebsitesWithEmails.length,
      remindersSent: results.filter(r => r.success).length,
      results
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in daily-payment-check function:", error);
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
