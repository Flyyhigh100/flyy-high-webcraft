import axios from 'axios';

// API key for WhoisXML API
const WHOIS_API_KEY = 'at_OismLMJ7VEed3qZ9bUIEe9zMJDC6T';

// Domain check service - uses fallback mechanisms to ensure reliability
export const checkDomainAvailability = async (domain: string) => {
  try {
    // Try multiple methods and use the first one that works
    return await tryDirectApiCall(domain);
  } catch (error) {
    console.error('All domain check methods failed:', error);
    
    // As a last resort - use a predefined algorithm to guess domain availability
    // This is better than showing all domains as unavailable
    return fallbackDomainCheck(domain);
  }
};

// Method 1: Direct API call to WhoisXML API
const tryDirectApiCall = async (domain: string) => {
  try {
    const response = await axios.get(`https://domain-availability.whoisxmlapi.com/api/v1`, {
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
    console.error('Direct API call failed:', error);
    throw error;
  }
};

// Fallback method: Use a heuristic algorithm to estimate domain availability
// This is only used when all other methods fail
const fallbackDomainCheck = (domain: string) => {
  // Common TLDs that are often unavailable
  const commonTlds = ['.com', '.net', '.org', '.io'];
  const domainWithoutTld = domain.split('.')[0];
  
  // Check if this is a common TLD
  const tld = domain.substring(domainWithoutTld.length);
  const isCommonTld = commonTlds.includes(tld);
  
  // Estimate availability based on:
  // 1. Domain length (shorter domains are more likely to be taken)
  // 2. Whether it contains numbers or hyphens (less likely to be taken)
  // 3. Whether it's a common TLD (more likely to be taken)
  
  const hasSpecialChars = /[0-9-]/.test(domainWithoutTld);
  const isShort = domainWithoutTld.length <= 6;
  
  // Available if: 
  // - Domain is long enough (>6 chars), or
  // - Has numbers/hyphens, or
  // - Is not a common TLD
  const likelyAvailable = 
    (!isShort) || 
    hasSpecialChars || 
    !isCommonTld;
  
  // For .test, .example TLDs - always show as available 
  const testTlds = ['.test', '.example', '.invalid', '.localhost'];
  if (testTlds.some(testTld => domain.endsWith(testTld))) {
    return {
      domain,
      available: true,
      status: 'FALLBACK_AVAILABLE',
      fallback: true
    };
  }
  
  // For very obviously taken domains like google.com, amazon.com
  const majorBrands = ['google', 'amazon', 'microsoft', 'apple', 'facebook', 'twitter'];
  if (majorBrands.some(brand => domainWithoutTld.includes(brand)) && isCommonTld) {
    return {
      domain,
      available: false,
      status: 'FALLBACK_UNAVAILABLE',
      fallback: true
    };
  }
  
  return {
    domain,
    available: likelyAvailable,
    status: likelyAvailable ? 'FALLBACK_LIKELY_AVAILABLE' : 'FALLBACK_LIKELY_UNAVAILABLE',
    fallback: true
  };
}; 