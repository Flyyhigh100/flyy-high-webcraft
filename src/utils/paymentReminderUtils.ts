
import { supabase } from "@/integrations/supabase/client";

export interface PaymentReminder {
  id: string;
  site_id: string;
  reminder_type: string;
  sent_at: string;
  email_status: string;
  amount_due: number;
  created_at: string;
}

export interface PaymentReminderRequest {
  siteId: string;
  reminderType: '3_day' | '7_day' | '14_day' | '30_day' | 'final_notice' | 'upcoming_7d' | 'upcoming_3d' | 'upcoming_1d';
  manualSend?: boolean;
}

export const sendPaymentReminder = async (request: PaymentReminderRequest) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-payment-reminder', {
      body: request
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    throw error;
  }
};

export const fetchPaymentReminders = async (siteId?: string) => {
  try {
    let query = supabase
      .from('payment_reminders')
      .select('*')
      .order('sent_at', { ascending: false });

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as PaymentReminder[];
  } catch (error) {
    console.error('Error fetching payment reminders:', error);
    throw error;
  }
};

export const triggerDailyPaymentCheck = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('daily-payment-check');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error triggering daily payment check:', error);
    throw error;
  }
};

export const updatePaymentStatuses = async () => {
  try {
    const { error } = await supabase.rpc('update_payment_statuses');
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating payment statuses:', error);
    throw error;
  }
};

export const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'current':
      return 'bg-green-100 text-green-800';
    case 'overdue_3d':
      return 'bg-yellow-100 text-yellow-800';
    case 'overdue_7d':
      return 'bg-orange-100 text-orange-800';
    case 'overdue_14d':
      return 'bg-red-100 text-red-800';
    case 'overdue_30d':
    case 'suspended':
      return 'bg-red-200 text-red-900';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case 'current':
      return 'Current';
    case 'overdue_3d':
      return '3 Days Overdue';
    case 'overdue_7d':
      return '7 Days Overdue';
    case 'overdue_14d':
      return '14 Days Overdue';
    case 'overdue_30d':
      return '30 Days Overdue';
    case 'suspended':
      return 'Suspended';
    default:
      return status;
  }
};
