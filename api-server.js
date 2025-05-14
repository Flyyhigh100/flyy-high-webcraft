import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

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
    'BOA_API_SECRET=your_bank_of_america_api_secret_here\n'
  );
  console.log('Created .env.local file with placeholder Bank of America API credentials.');
  console.log('Please update with your actual credentials before processing payments.');
}

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