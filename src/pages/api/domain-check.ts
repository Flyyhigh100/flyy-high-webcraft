import axios from 'axios';

// Define the request and response types
type DomainCheckRequest = {
  query: {
    domain?: string;
  };
};

type DomainCheckResponse = {
  domain: string;
  available: boolean;
  status?: string;
  error?: string;
};

export default async function handler(req: DomainCheckRequest, res: any) {
  // Get the domain query parameter
  const { domain } = req.query;

  // Validate domain parameter
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ 
      error: 'Missing or invalid domain parameter' 
    } as DomainCheckResponse);
  }

  // WhoisXML API configuration
  const WHOIS_API_KEY = process.env.WHOIS_API_KEY || 'at_OismLMJ7VEed3qZ9bUIEe9zMJDC6T';
  const WHOIS_API_URL = 'https://domain-availability.whoisxmlapi.com/api/v1';

  try {
    // Make request to WhoisXML API
    const response = await axios.get(WHOIS_API_URL, {
      params: {
        apiKey: WHOIS_API_KEY,
        domainName: domain,
      },
    });

    // Determine availability from response
    const available = response.data.DomainInfo.domainAvailability === 'AVAILABLE';

    // Return domain check result
    return res.status(200).json({
      domain,
      available,
      status: response.data.DomainInfo.domainAvailability,
    } as DomainCheckResponse);
  } catch (error) {
    console.error('Domain check error:', error);
    return res.status(500).json({ 
      domain,
      available: false,
      error: 'Failed to check domain availability' 
    } as DomainCheckResponse);
  }
} 