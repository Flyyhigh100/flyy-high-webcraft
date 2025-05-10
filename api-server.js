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

// Load environment variables
dotenv.config();

// Create .env file if it doesn't exist
const envPath = join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, 'WHOIS_API_KEY=at_OismLMJ7VEed3qZ9bUIEe9zMJDC6T\n');
  console.log('Created .env file with the WhoisXML API key.');
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

// Start the server
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
  console.log(`To check a domain, visit: http://localhost:${PORT}/api/domain-check?domain=example.com`);
}); 