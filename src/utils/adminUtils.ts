
import { supabase } from "@/integrations/supabase/client";
import { Payment, UserProfile, RevenueData, ClientWebsite } from "@/types/admin";

export const fetchProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
  
  return data || [];
};

export const checkPaymentsTableExists = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.log('Payments table does not exist yet');
    return false;
  }
};

export const checkWebsitesTableExists = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('websites_table_exists');
    return data === true;
  } catch (error) {
    console.log('Error checking websites table existence:', error);
    return false;
  }
};

export const fetchCompletedPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      profiles!payments_user_id_fkey(email)
    `)
    .eq('status', 'completed')
    .order('payment_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching completed payments:', error);
    throw error;
  }
  
  // Transform the data to match the Payment interface
  return (data || []).map(payment => ({
    id: payment.id,
    user_id: payment.user_id,
    user_email: payment.profiles?.email || 'Unknown',
    amount: payment.amount,
    status: payment.status,
    payment_date: payment.payment_date,
    plan: payment.plan_type
  }));
};

export const fetchUpcomingPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('websites')
    .select(`
      id,
      name,
      next_payment_date,
      next_payment_amount,
      plan_type,
      payment_status,
      profiles!websites_user_id_fkey(email)
    `)
    .not('next_payment_date', 'is', null)
    .gte('next_payment_date', new Date().toISOString().split('T')[0])
    .order('next_payment_date', { ascending: true });
  
  if (error) {
    console.error('Error fetching upcoming payments:', error);
    throw error;
  }
  
  // Transform the data to match the Payment interface
  return (data || []).map(website => ({
    id: website.id,
    user_id: website.id, // Using website id as user_id for compatibility
    user_email: website.profiles?.email || 'Unknown',
    amount: website.next_payment_amount || 0,
    status: 'pending',
    payment_date: website.next_payment_date,
    plan: website.plan_type
  }));
};

export const fetchClientWebsites = async (): Promise<ClientWebsite[]> => {
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching client websites:', error);
    throw error;
  }
  
  return (data || []).map(website => ({
    id: website.id,
    name: website.name,
    url: website.url,
    planType: website.plan_type,
    nextPaymentDate: website.next_payment_date || '',
    nextPaymentAmount: website.next_payment_amount || 0,
    paymentStatus: website.payment_status || 'current',
    lastPaymentReminderSent: website.last_payment_reminder_sent || '',
    gracePeriodEndDate: website.grace_period_end_date || '',
    suspensionDate: website.suspension_date || ''
  }));
};

export const calculateRevenueData = (payments: Payment[]): RevenueData => {
  const monthlyTotals: { [key: string]: number } = {};
  
  // Initialize all months to 0
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months.forEach(month => {
    monthlyTotals[month] = 0;
  });
  
  // Calculate monthly totals from payments
  payments.forEach(payment => {
    const date = new Date(payment.payment_date);
    const month = months[date.getMonth()];
    monthlyTotals[month] += payment.amount;
  });
  
  return {
    labels: months,
    datasets: [
      {
        label: 'Monthly Revenue',
        data: months.map(month => monthlyTotals[month]),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
      },
    ],
  };
};

export const updatePaymentStatuses = async () => {
  const { error } = await supabase.rpc('update_payment_statuses');
  
  if (error) {
    console.error('Error updating payment statuses:', error);
    throw error;
  }
};
