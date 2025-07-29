
import { supabase } from "@/integrations/supabase/client";
import { Payment, UserProfile, RevenueData, ClientWebsite } from "@/types/admin";

export const fetchProfiles = async (): Promise<UserProfile[]> => {
  // Check authentication first
  const { data: { user } } = await supabase.auth.getUser();
  console.log('fetchProfiles: Current user:', user?.email);
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_sessions(last_sign_in)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching profiles:', error);
    console.error('Auth state during error:', await supabase.auth.getUser());
    throw error;
  }
  
  // Transform the data to include last_sign_in from user_sessions
  const profiles = (data || []).map((profile: any) => ({
    ...profile,
    last_sign_in: profile.user_sessions?.[0]?.last_sign_in || null
  }));
  
  return profiles;
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
  // First fetch payments
  const { data: paymentsData, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .eq('status', 'completed')
    .order('payment_date', { ascending: false });
  
  if (paymentsError) {
    console.error('Error fetching completed payments:', paymentsError);
    throw paymentsError;
  }

  // Then fetch profiles to get email addresses
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, email');
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    throw profilesError;
  }

  // Create a map of user_id to email for quick lookup
  const emailMap = new Map(profilesData?.map(profile => [profile.user_id, profile.email]) || []);
  
  // Transform the data to match the Payment interface
  return (paymentsData || []).map(payment => ({
    id: payment.id,
    user_id: payment.user_id,
    user_email: emailMap.get(payment.user_id) || 'Unknown',
    amount: payment.amount,
    status: payment.status,
    payment_date: payment.payment_date,
    plan: payment.plan_type
  }));
};

export const fetchUpcomingPayments = async (): Promise<Payment[]> => {
  // Check authentication first
  const { data: { user } } = await supabase.auth.getUser();
  console.log('fetchUpcomingPayments: Current user:', user?.email);
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // First fetch websites with upcoming payments
  const { data: websitesData, error: websitesError } = await supabase
    .from('websites')
    .select('*')
    .not('next_payment_date', 'is', null)
    .gte('next_payment_date', new Date().toISOString().split('T')[0])
    .order('next_payment_date', { ascending: true });
  
  if (websitesError) {
    console.error('Error fetching upcoming payments:', websitesError);
    console.error('Auth state during error:', await supabase.auth.getUser());
    throw websitesError;
  }

  // Then fetch profiles to get email addresses
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, email');
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    throw profilesError;
  }

  // Create a map of user_id to email for quick lookup
  const emailMap = new Map(profilesData?.map(profile => [profile.user_id, profile.email]) || []);
  
  // Transform the data to match the Payment interface
  return (websitesData || []).map(website => ({
    id: website.id,
    user_id: website.user_id || website.id, // Fallback to website id if user_id is null
    user_email: emailMap.get(website.user_id) || 'Unknown',
    amount: website.next_payment_amount || 0,
    status: 'pending',
    payment_date: website.next_payment_date,
    plan: website.plan_type
  }));
};

export const fetchClientWebsites = async (): Promise<ClientWebsite[]> => {
  // Check authentication first
  const { data: { user } } = await supabase.auth.getUser();
  console.log('fetchClientWebsites: Current user:', user?.email);
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching client websites:', error);
    console.error('Auth state during error:', await supabase.auth.getUser());
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
