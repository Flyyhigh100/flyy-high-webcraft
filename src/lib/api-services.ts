import axios from 'axios';

// Domain check service - calls our backend API
export const checkDomainAvailability = async (domain: string) => {
  try {
    const response = await axios.get(`/api/domain-check?domain=${encodeURIComponent(domain)}`);
    return response.data;
  } catch (error) {
    console.error('Error checking domain availability:', error);
    throw error;
  }
}; 