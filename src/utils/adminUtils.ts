
import { supabase } from "@/integrations/supabase/client";
import { Payment, UserProfile, RevenueData, ClientWebsite } from "@/types/admin";

// Ensure authentication is properly set before making database calls
const ensureAuthenticated = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.user) {
    console.error('Authentication check failed:', error);
    throw new Error('Authentication required');
  }
  
  console.log('Authentication verified for user:', session.user.email);
  return session;
};

export const fetchProfiles = async (): Promise<UserProfile[]> => {
  // Ensure proper authentication before proceeding
  const session = await ensureAuthenticated();

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
  // Ensure proper authentication before proceeding
  const session = await ensureAuthenticated();
  
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

  // Get user IDs and fetch emails using the secure function
  const userIds = (paymentsData || []).map(p => p.user_id);
  
  let emailMap = new Map();
  if (userIds.length > 0) {
    const { data: emailsData, error: emailsError } = await supabase
      .rpc('get_user_emails_bulk', { user_ids: userIds });
    
    if (emailsError) {
      console.error('Error fetching emails:', emailsError);
      // Continue without emails rather than throwing
    } else {
      emailMap = new Map((emailsData || []).map((e: any) => [e.user_id, e.email]));
    }
  }
  
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
  // Ensure proper authentication before proceeding
  const session = await ensureAuthenticated();

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

  // Get user IDs and fetch emails using the secure function
  const userIds = (websitesData || []).map(w => w.user_id).filter(Boolean);
  
  let emailMap = new Map();
  if (userIds.length > 0) {
    const { data: emailsData, error: emailsError } = await supabase
      .rpc('get_user_emails_bulk', { user_ids: userIds });
    
    if (emailsError) {
      console.error('Error fetching emails:', emailsError);
      // Continue without emails rather than throwing
    } else {
      emailMap = new Map((emailsData || []).map((e: any) => [e.user_id, e.email]));
    }
  }
  
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
  // Ensure proper authentication before proceeding
  const session = await ensureAuthenticated();

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
