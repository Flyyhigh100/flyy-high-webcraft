import { supabase } from "@/integrations/supabase/client";
import { Payment, UserProfile, RevenueData, ClientWebsite } from "@/types/admin";

// Fetch profiles from Supabase
export async function fetchProfiles(): Promise<UserProfile[]> {
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
    
  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    throw profilesError;
  }
  
  if (profilesData) {
    return profilesData.map(profile => ({
      id: profile.id,
      email: profile.email || '',
      role: profile.role || 'user',
      created_at: profile.created_at || '',
      updated_at: profile.updated_at || '',
      user_id: profile.user_id || profile.id,
      last_sign_in: ''  // We don't have this data from profiles table
    }));
  }
  
  return [];
}

// Check if payments table exists
export async function checkPaymentsTableExists(): Promise<boolean> {
  try {
    const { data: tableExistsData, error: tableExistsError } = await supabase
      .rpc('table_exists', { 
        table_name: 'payments', 
        schema_name: 'public' 
      });
    
    if (tableExistsError) {
      console.error("Error checking if payments table exists:", tableExistsError);
      return false;
    }
    
    return !!tableExistsData;
  } catch (error) {
    console.error('Error checking if payments table exists:', error);
    return false;
  }
}

// Check if websites table exists
export async function checkWebsitesTableExists(): Promise<boolean> {
  try {
    const { data: tableExistsData, error: tableExistsError } = await supabase
      .rpc('websites_table_exists');
    
    if (tableExistsError) {
      console.error("Error checking if websites table exists:", tableExistsError);
      return false;
    }
    
    return !!tableExistsData;
  } catch (error) {
    console.error('Error checking if websites table exists:', error);
    return false;
  }
}

// Fetch client websites
export async function fetchClientWebsites(): Promise<ClientWebsite[]> {
  const { data: websitesData, error: websitesError } = await supabase
    .from('websites')
    .select('*')
    .order('name');
    
  if (websitesError) {
    console.error("Error fetching client websites:", websitesError);
    return [];
  }
  
  if (!websitesData) return [];
  
  return websitesData.map(website => ({
    id: website.id,
    name: website.name,
    url: website.url,
    planType: website.plan_type,
    nextPaymentDate: website.next_payment_date || '',
    nextPaymentAmount: website.next_payment_amount || 0
  }));
}

// Fetch completed payments
export async function fetchCompletedPayments(): Promise<Payment[]> {
  const { data: paymentsData, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .eq('status', 'completed');
    
  if (paymentsError) {
    console.error("Error fetching payments:", paymentsError);
    return [];
  }
  
  if (!paymentsData) return [];
  
  // Format payments with user emails
  const formattedPayments: Payment[] = [];
  
  for (const payment of paymentsData) {
    // Get user email from profiles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', payment.user_id)
      .single();
      
    const email = profileData?.email || 'Unknown';
    
    formattedPayments.push({
      id: payment.id,
      user_id: payment.user_id,
      user_email: email,
      amount: payment.amount,
      status: payment.status,
      payment_date: payment.payment_date,
      plan: payment.plan
    });
  }
  
  return formattedPayments;
}

// Fetch upcoming payments
export async function fetchUpcomingPayments(): Promise<Payment[]> {
  const { data: upcomingData, error: upcomingError } = await supabase
    .from('payments')
    .select('*')
    .eq('status', 'upcoming');
    
  if (upcomingError) {
    console.error("Error fetching upcoming payments:", upcomingError);
    return [];
  }
  
  if (!upcomingData) return [];
  
  // Format upcoming payments with user emails
  const formattedUpcoming: Payment[] = [];
  
  for (const payment of upcomingData) {
    // Get user email from profiles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', payment.user_id)
      .single();
      
    const email = profileData?.email || 'Unknown';
    
    formattedUpcoming.push({
      id: payment.id,
      user_id: payment.user_id,
      user_email: email,
      amount: payment.amount,
      status: payment.status,
      payment_date: payment.payment_date,
      plan: payment.plan
    });
  }
  
  return formattedUpcoming;
}

// Calculate revenue data from payments
export function calculateRevenueData(payments: Payment[]): RevenueData {
  const revenueData: RevenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  if (payments.length > 0) {
    const monthlyRevenue = Array(12).fill(0);
    
    payments.forEach(payment => {
      const date = new Date(payment.payment_date);
      const month = date.getMonth();
      monthlyRevenue[month] += payment.amount;
    });
    
    revenueData.datasets[0].data = monthlyRevenue;
  }
  
  return revenueData;
}
