import axios from 'axios';

// API key for WhoisXML API
const WHOIS_API_KEY = 'at_OismLMJ7VEed3qZ9bUIEe9zMJDC6T';
const WHOIS_API_URL = 'https://domain-availability.whoisxmlapi.com/api/v1';

// Use a CORS proxy for production calls to avoid CORS issues
// This uses the public CORS Anywhere service - consider creating your own for production
const CORS_PROXY = 'https://corsproxy.io/?';

// Domain check service - calls WhoisXML API directly for production
export const checkDomainAvailability = async (domain: string) => {
  try {
    // Use the CORS proxy in front of the WhoisXML API URL
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(WHOIS_API_URL)}`;
    
    // Production environment - call WhoisXML API directly through proxy
    const response = await axios.get(proxyUrl, {
      params: {
        apiKey: WHOIS_API_KEY,
        domainName: domain,
      },
    });
    
    return {
      domain,
      available: response.data.DomainInfo.domainAvailability === 'AVAILABLE',
      status: response.data.DomainInfo.domainAvailability
    };
  } catch (error) {
    console.error('Error checking domain availability:', error);
    // Return a default response if API fails
    return {
      domain,
      available: false,
      status: 'ERROR',
      error: 'Failed to check domain availability'
    };
  }
}; 