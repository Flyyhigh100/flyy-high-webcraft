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

    // Check if user is admin using is_admin RPC
    const { data: isAdminRpc, error: isAdminError } = await supabaseAdmin
      .rpc('is_admin', { _user_id: user.id });

    if (isAdminError || !isAdminRpc) {
      console.error('Admin check failed:', isAdminError);
      throw new Error('Admin access required');
    }

    console.log('Admin access verified for:', user.email);

    // Fetch all admin data using service role (bypasses RLS)
    const [profilesResult, paymentsResult, websitesResult, sessionsResult, authUsersResult, userRolesResult] = await Promise.all([
      // Fetch all profiles with last sign-in information
      supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false }),

      supabaseAdmin
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false }),

      supabaseAdmin
        .from('websites')
        .select('*')
        .order('name', { ascending: true }),

      // Fetch user sessions for last login tracking  
      supabaseAdmin
        .from('user_sessions')
        .select('*')
        .order('last_sign_in', { ascending: false }),

      // Fetch emails from auth.users (profiles table doesn't have email column)
      supabaseAdmin.auth.admin.listUsers(),

      // Fetch user roles from user_roles table
      supabaseAdmin
        .from('user_roles')
        .select('user_id, role')
    ]);

    console.log('Data fetch results:', {
      profiles: profilesResult.error ? 'error' : `${profilesResult.data?.length} records`,
      payments: paymentsResult.error ? 'error' : `${paymentsResult.data?.length} records`,
      websites: websitesResult.error ? 'error' : `${websitesResult.data?.length} records`,
      sessions: sessionsResult.error ? 'error' : `${sessionsResult.data?.length} records`,
      authUsers: authUsersResult.error ? 'error' : `${authUsersResult.data?.users?.length} records`,
      userRoles: userRolesResult.error ? 'error' : `${userRolesResult.data?.length} records`
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

    if (sessionsResult.error) {
      console.error('Sessions fetch error:', sessionsResult.error);
      // Don't throw error for sessions - it's not critical
      console.warn('Continuing without session data');
    }

    if (authUsersResult.error) {
      console.error('Auth users fetch error:', authUsersResult.error);
      throw new Error(`Failed to fetch auth users: ${authUsersResult.error.message}`);
    }

    // Create a map of user sessions for quick lookup
    const sessionsMap = new Map();
    if (sessionsResult.data) {
      sessionsResult.data.forEach(session => {
        if (!sessionsMap.has(session.user_id) || 
            new Date(session.last_sign_in) > new Date(sessionsMap.get(session.user_id))) {
          sessionsMap.set(session.user_id, session.last_sign_in);
        }
      });
    }

    // Create email lookup map from auth.users
    const emailMap = new Map<string, string>();
    if (authUsersResult.data?.users) {
      authUsersResult.data.users.forEach(u => {
        emailMap.set(u.id, u.email || '');
      });
    }

    // Create role lookup map from user_roles table (prioritize admin role)
    const roleMap = new Map<string, string>();
    if (userRolesResult.data) {
      userRolesResult.data.forEach((ur: any) => {
        const existingRole = roleMap.get(ur.user_id);
        if (!existingRole || ur.role === 'admin') {
          roleMap.set(ur.user_id, ur.role);
        }
      });
    }

    // Build a profiles map for quick lookups
    const profilesMap = new Map<string, any>();
    (profilesResult.data || []).forEach((p: any) => {
      profilesMap.set(p.id, p);
    });

    // Transform profiles data with emails and roles
    const profiles = (profilesResult.data || []).map((profile: any) => ({
      id: profile.id,
      email: emailMap.get(profile.id) || 'Unknown',
      role: roleMap.get(profile.id) || 'user',
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      user_id: profile.id, // user_id column removed - id is the canonical user identifier
      last_sign_in: sessionsMap.get(profile.id) || null
    }));

    const payments = (paymentsResult.data || []).map((payment: any) => {
      const rawAmount = Number(payment.amount) || 0;
      const amount = rawAmount > 200 ? rawAmount / 100 : rawAmount; // normalize cents to dollars
      return {
        id: payment.id,
        user_id: payment.user_id,
        user_email: emailMap.get(payment.user_id) || 'Unknown',
        amount,
        status: payment.status,
        payment_date: payment.payment_date,
        plan: payment.plan_type
      };
    });

    // Transform websites data for upcoming payments (due in next 7-30 days)
    const upcomingPayments = (websitesResult.data || [])
      .filter(website => {
        if (!website.next_payment_date) return false;
        const nextPaymentDate = new Date(website.next_payment_date);
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 30); // Next 30 days
        return nextPaymentDate > today && nextPaymentDate <= futureDate;
      })
      .map((website: any) => ({
        id: website.id,
        user_id: website.user_id || '',
        user_email: emailMap.get(website.user_id || '') || 'Unknown',
        amount: website.next_payment_amount || 0,
        status: website.payment_status || 'pending',
        payment_date: website.next_payment_date,
        plan: website.plan_type
      }));

    // Transform websites data with client information
    const clientWebsites = (websitesResult.data || []).map((website: any) => {
      const clientProfile = profilesMap.get(website.user_id || '');
      return {
        id: website.id,
        name: website.name,
        url: website.url,
        planType: website.plan_type,
        nextPaymentDate: website.next_payment_date || '',
        nextPaymentAmount: website.next_payment_amount || 0,
        paymentStatus: website.payment_status,
        lastPaymentReminderSent: website.last_payment_reminder_sent,
        gracePeriodEndDate: website.grace_period_end_date,
        suspensionDate: website.suspension_date,
        clientEmail: emailMap.get(website.user_id || '') || 'Unknown',
        clientRole: clientProfile?.role || 'user'
      };
    });

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