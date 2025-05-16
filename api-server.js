import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env and .env.local
dotenv.config();
dotenv.config({ path: join(__dirname, '.env.local') });

// Create .env file if it doesn't exist
const envPath = join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, 'WHOIS_API_KEY=at_OismLMJ7VEed3qZ9bUIEe9zMJDC6T\n');
  console.log('Created .env file with the WhoisXML API key.');
}

// Create .env.local file for sensitive credentials if it doesn't exist
const envLocalPath = join(__dirname, '.env.local');
if (!fs.existsSync(envLocalPath)) {
  fs.writeFileSync(envLocalPath, 
    'BOA_API_KEY=your_bank_of_america_api_key_here\n' +
    'BOA_API_SECRET=your_bank_of_america_api_secret_here\n' +
    'NEXT_PUBLIC_SUPABASE_URL=https://wutyryaqlmgsbllnyoop.supabase.co\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dHlyeWFxbG1nc2JsbG55b29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NDgwNTgsImV4cCI6MjA2MTEyNDA1OH0.3dlF73k20xg6VhEQPiPgbBt5UifuE3O0J_4SsQ_wnFc\n' +
    'SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here\n'
  );
  console.log('Created .env.local file with placeholder credentials.');
  console.log('Please update with your actual credentials before processing data.');
}

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wutyryaqlmgsbllnyoop.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role for full admin access
const adminSupabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Create Supabase client with anon key for public access
const publicSupabase = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dHlyeWFxbG1nc2JsbG55b29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NDgwNTgsImV4cCI6MjA2MTEyNDA1OH0.3dlF73k20xg6VhEQPiPgbBt5UifuE3O0J_4SsQ_wnFc'
);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint for domain checking
app.get('/api/domain-check', async (req, res) => {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: 'Missing or invalid domain parameter' });
  }

  // Use API key directly if environment variable doesn't work
  const WHOIS_API_KEY = process.env.WHOIS_API_KEY || 'at_OismLMJ7VEed3qZ9bUIEe9zMJDC6T';
  const WHOIS_API_URL = 'https://domain-availability.whoisxmlapi.com/api/v1';

  try {
    const response = await axios.get(WHOIS_API_URL, {
      params: {
        apiKey: WHOIS_API_KEY,
        domainName: domain,
      },
    });

    const available = response.data.DomainInfo.domainAvailability === 'AVAILABLE';

    return res.status(200).json({
      domain,
      available,
      status: response.data.DomainInfo.domainAvailability,
    });
  } catch (error) {
    console.error('Domain check error:', error);
    return res.status(500).json({ error: 'Failed to check domain availability' });
  }
});

// API endpoint for payment processing
app.post('/api/pay', async (req, res) => {
  const { email, plan } = req.body;

  // Input validation
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Invalid email address' });
  }

  if (!plan || !['basic', 'pro'].includes(plan)) {
    return res.status(400).json({ success: false, error: 'Invalid plan' });
  }

  // Calculate amount based on plan
  const amount = plan === 'basic' ? 10.00 : 20.00;

  try {
    // Get API credentials from environment variables
    const apiKey = process.env.BOA_API_KEY;
    const apiSecret = process.env.BOA_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('Missing Bank of America API credentials');
      return res.status(500).json({ 
        success: false, 
        error: 'Payment service configuration error' 
      });
    }

    // Placeholder for actual Bank of America API call
    // In a real implementation, you would call the actual API endpoint
    // const response = await axios.post('https://api.bankofamerica.com/payments', {
    //   amount,
    //   currency: 'USD',
    //   customer: { email },
    //   description: `Payment for ${plan} plan`,
    // }, {
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //     'X-API-Secret': apiSecret,
    //     'Content-Type': 'application/json'
    //   }
    // });

    // For now, simulate a successful API response
    const mockPaymentResponse = {
      success: true,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      redirectUrl: `https://bank.com/payment/session/xyz_${plan}_${Math.random().toString(36).substring(2, 8)}`
    };

    // Return successful response
    return res.status(200).json({
      success: true,
      redirectUrl: mockPaymentResponse.redirectUrl
    });
  } catch (error) {
    // Log the error but don't expose sensitive details to the client
    console.error('Payment processing error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Payment processing failed'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
  console.log(`To check a domain, visit: http://localhost:${PORT}/api/domain-check?domain=example.com`);
});

// API endpoint for submitting support tickets
app.post('/api/support/submit', async (req, res) => {
  const { siteId, subject, message, userId } = req.body;
  
  // Basic validation
  if (!siteId || !subject || !message) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: siteId, subject, and message are required' 
    });
  }

  try {
    // Check if the adminSupabase client is available
    if (!adminSupabase) {
      console.error('Supabase service role key not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Database service configuration error' 
      });
    }

    // Verify that the site exists
    const { data: siteData, error: siteError } = await adminSupabase
      .from('websites')
      .select('id, user_id')
      .eq('id', siteId)
      .single();

    if (siteError || !siteData) {
      console.error('Site verification error:', siteError);
      return res.status(404).json({ 
        success: false, 
        error: 'Site not found' 
      });
    }

    // Insert the support ticket
    const { data, error } = await adminSupabase
      .from('support_tickets')
      .insert({
        site_id: siteId,
        subject,
        message,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Support ticket creation error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create support ticket' 
      });
    }

    return res.status(201).json({ 
      success: true, 
      ticket: data 
    });
  } catch (error) {
    console.error('Support ticket submission error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process support ticket' 
    });
  }
});

// API endpoint for listing all support tickets (admin view)
app.get('/api/support/list', async (req, res) => {
  try {
    // Check if the adminSupabase client is available
    if (!adminSupabase) {
      console.error('Supabase service role key not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Database service configuration error' 
      });
    }

    // Get all tickets with site information
    const { data, error } = await adminSupabase
      .from('support_tickets')
      .select(`
        *,
        website:site_id (
          id,
          domain,
          user_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Support ticket list error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to retrieve support tickets' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      tickets: data 
    });
  } catch (error) {
    console.error('Support ticket list error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process support tickets request' 
    });
  }
});

// API endpoint for getting payments for a specific site
app.get('/api/payments/site/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ 
      success: false, 
      error: 'Site ID is required' 
    });
  }

  try {
    // Check if the adminSupabase client is available
    if (!adminSupabase) {
      console.error('Supabase service role key not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Database service configuration error' 
      });
    }

    // Get all payments for the specified site
    const { data, error } = await adminSupabase
      .from('payments')
      .select('*')
      .eq('site_id', id)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Site payments error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to retrieve payment data' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      payments: data 
    });
  } catch (error) {
    console.error('Site payments error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process payment data request' 
    });
  }
});

// API endpoint for payment graph data
app.get('/api/payments/graph', async (req, res) => {
  try {
    // Check if the adminSupabase client is available
    if (!adminSupabase) {
      console.error('Supabase service role key not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Database service configuration error' 
      });
    }

    // Get monthly payment totals for the last 12 months
    const { data, error } = await adminSupabase.rpc('get_monthly_payment_totals');

    // If RPC function is not available, fall back to manual calculation
    if (error && error.message.includes('function "get_monthly_payment_totals" does not exist')) {
      // Get all payments from the last 12 months
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const { data: paymentsData, error: paymentsError } = await adminSupabase
        .from('payments')
        .select('amount, payment_date, status')
        .gte('payment_date', oneYearAgo.toISOString())
        .eq('status', 'completed');
      
      if (paymentsError) {
        console.error('Payment graph data error:', paymentsError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to retrieve payment graph data' 
        });
      }
      
      // Process data for the graph - group by month
      const monthlyData = {};
      
      paymentsData.forEach(payment => {
        const date = new Date(payment.payment_date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = 0;
        }
        
        monthlyData[monthYear] += parseFloat(payment.amount);
      });
      
      // Convert to array format for the graph
      const graphData = Object.entries(monthlyData).map(([month, total]) => ({
        month,
        total
      })).sort((a, b) => a.month.localeCompare(b.month));
      
      return res.status(200).json({
        success: true, 
        data: graphData
      });
    } else if (error) {
      console.error('Payment graph data error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to retrieve payment graph data' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('Payment graph data error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process payment graph data request' 
    });
  }
});

// API endpoint for manually adding a payment
app.post('/api/payments/add', async (req, res) => {
  const { siteId, amount, planType, method = 'manual', paymentDate = new Date().toISOString() } = req.body;
  
  // Basic validation
  if (!siteId || !amount || !planType) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: siteId, amount, and planType are required' 
    });
  }

  try {
    // Check if the adminSupabase client is available
    if (!adminSupabase) {
      console.error('Supabase service role key not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Database service configuration error' 
      });
    }

    // Verify that the site exists
    const { data: siteData, error: siteError } = await adminSupabase
      .from('websites')
      .select('id, user_id')
      .eq('id', siteId)
      .single();

    if (siteError || !siteData) {
      console.error('Site verification error:', siteError);
      return res.status(404).json({ 
        success: false, 
        error: 'Site not found' 
      });
    }

    // Insert the payment record
    const { data, error } = await adminSupabase
      .from('payments')
      .insert({
        site_id: siteId,
        user_id: siteData.user_id,
        amount: parseFloat(amount),
        status: 'completed',
        payment_date: paymentDate,
        plan_type: planType,
        method
      })
      .select()
      .single();

    if (error) {
      console.error('Payment creation error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create payment record' 
      });
    }

    return res.status(201).json({ 
      success: true, 
      payment: data 
    });
  } catch (error) {
    console.error('Payment creation error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process payment creation' 
    });
  }
}); 