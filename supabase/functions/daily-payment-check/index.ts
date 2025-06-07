
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
      .select('*, profiles!websites_user_id_fkey(email)')
      .in('payment_status', ['overdue_3d', 'overdue_7d', 'overdue_14d', 'overdue_30d'])
      .not('next_payment_date', 'is', null);

    if (fetchError) {
      console.error("Error fetching overdue websites:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${overdueWebsites?.length || 0} overdue websites`);

    const results = [];

    for (const website of overdueWebsites || []) {
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
          // Call the send-payment-reminder function
          const reminderResponse = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-payment-reminder`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
              },
              body: JSON.stringify({
                siteId: website.id,
                reminderType: reminderType,
                manualSend: false
              })
            }
          );

          const reminderResult = await reminderResponse.json();
          
          results.push({
            websiteId: website.id,
            websiteName: website.name,
            reminderType,
            success: reminderResponse.ok,
            message: reminderResult.message || reminderResult.error
          });

          console.log(`Sent ${reminderType} reminder for ${website.name}`);
          
        } catch (error) {
          console.error(`Error sending reminder for ${website.name}:`, error);
          results.push({
            websiteId: website.id,
            websiteName: website.name,
            reminderType,
            success: false,
            message: error.message
          });
        }
      }
    }

    console.log("Daily payment check completed");

    return new Response(JSON.stringify({ 
      success: true,
      checkedWebsites: overdueWebsites?.length || 0,
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
