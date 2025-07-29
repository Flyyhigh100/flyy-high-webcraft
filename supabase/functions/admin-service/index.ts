import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Admin service called');

    // Get the authorization header from the request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client with service role (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create regular client to verify the user's token
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify the user's token and get user info
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User verification failed:', userError);
      throw new Error('Invalid authentication token');
    }

    console.log('User verified:', user.email);

    // Check if user is admin (multiple methods for reliability)
    let isAdmin = false;

    // Method 1: Direct email check
    if (user.email === 'flyyhigh824@gmail.com') {
      isAdmin = true;
      console.log('Admin access granted via email check');
    } else {
      // Method 2: Check profile role using service role
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profileError && profile?.role === 'admin') {
        isAdmin = true;
        console.log('Admin access granted via profile check');
      }
    }

    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    // Fetch all admin data using service role (bypasses RLS)
    const [profilesResult, paymentsResult, websitesResult] = await Promise.all([
      // Fetch all profiles with session data
      supabaseAdmin
        .from('profiles')
        .select(`
          *,
          user_sessions(last_sign_in)
        `)
        .order('created_at', { ascending: false }),

      // Fetch completed payments with user emails
      supabaseAdmin
        .from('payments')
        .select(`
          *,
          profiles(email)
        `)
        .eq('status', 'completed')
        .order('payment_date', { ascending: false }),

      // Fetch all websites
      supabaseAdmin
        .from('websites')
        .select('*')
        .order('name', { ascending: true })
    ]);

    console.log('Data fetch results:', {
      profiles: profilesResult.error ? 'error' : `${profilesResult.data?.length} records`,
      payments: paymentsResult.error ? 'error' : `${paymentsResult.data?.length} records`,
      websites: websitesResult.error ? 'error' : `${websitesResult.data?.length} records`
    });

    // Check for errors
    if (profilesResult.error) {
      console.error('Profiles fetch error:', profilesResult.error);
      throw new Error(`Failed to fetch profiles: ${profilesResult.error.message}`);
    }

    if (paymentsResult.error) {
      console.error('Payments fetch error:', paymentsResult.error);
      throw new Error(`Failed to fetch payments: ${paymentsResult.error.message}`);
    }

    if (websitesResult.error) {
      console.error('Websites fetch error:', websitesResult.error);
      throw new Error(`Failed to fetch websites: ${websitesResult.error.message}`);
    }

    // Transform profiles data
    const profiles = (profilesResult.data || []).map(profile => ({
      id: profile.id,
      email: profile.email || '',
      role: profile.role || 'user',
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      user_id: profile.user_id || profile.id,
      last_sign_in: profile.user_sessions?.[0]?.last_sign_in || null
    }));

    // Transform payments data
    const payments = (paymentsResult.data || []).map(payment => ({
      id: payment.id,
      user_id: payment.user_id,
      user_email: payment.profiles?.email || 'Unknown',
      amount: payment.amount,
      status: payment.status,
      payment_date: payment.payment_date,
      plan: payment.plan_type
    }));

    // Transform websites data for upcoming payments
    const upcomingPayments = (websitesResult.data || [])
      .filter(website => {
        if (!website.next_payment_date) return false;
        const nextPaymentDate = new Date(website.next_payment_date);
        const today = new Date();
        return nextPaymentDate <= today;
      })
      .map(website => ({
        id: website.id,
        user_id: website.user_id || '',
        user_email: 'Unknown', // We'd need to fetch this separately if needed
        amount: website.next_payment_amount || 0,
        status: website.payment_status || 'pending',
        payment_date: website.next_payment_date,
        plan: website.plan_type
      }));

    // Transform websites data
    const clientWebsites = (websitesResult.data || []).map(website => ({
      id: website.id,
      name: website.name,
      url: website.url,
      planType: website.plan_type,
      nextPaymentDate: website.next_payment_date || '',
      nextPaymentAmount: website.next_payment_amount || 0,
      paymentStatus: website.payment_status,
      lastPaymentReminderSent: website.last_payment_reminder_sent,
      gracePeriodEndDate: website.grace_period_end_date,
      suspensionDate: website.suspension_date
    }));

    // Calculate revenue data
    const revenueData = calculateRevenueData(payments);

    const responseData = {
      profiles,
      payments,
      upcomingPayments,
      clientWebsites,
      revenueData
    };

    console.log('Returning admin data:', {
      profilesCount: profiles.length,
      paymentsCount: payments.length,
      upcomingPaymentsCount: upcomingPayments.length,
      websitesCount: clientWebsites.length
    });

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Admin service error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to calculate revenue data
function calculateRevenueData(payments: any[]) {
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const monthlyTotals = new Array(12).fill(0);

  payments.forEach(payment => {
    const paymentDate = new Date(payment.payment_date);
    if (paymentDate.getFullYear() === currentYear) {
      const month = paymentDate.getMonth();
      monthlyTotals[month] += parseFloat(payment.amount) || 0;
    }
  });

  return {
    labels: monthLabels,
    datasets: [
      {
        label: 'Monthly Revenue',
        data: monthlyTotals,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
      },
    ],
  };
}