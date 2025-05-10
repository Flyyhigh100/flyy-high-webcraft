import axios from 'axios';

const WHOIS_API_KEY = import.meta.env.VITE_WHOIS_API_KEY;
const WHOIS_API_URL = 'https://domain-availability.whoisxmlapi.com/api/v1';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const domain = url.searchParams.get('domain');

  if (!domain) {
    return new Response(
      JSON.stringify({ error: 'Missing or invalid domain parameter' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const response = await axios.get(WHOIS_API_URL, {
      params: {
        apiKey: WHOIS_API_KEY,
        domainName: domain,
      },
    });

    const available = response.data.DomainInfo.domainAvailability === 'AVAILABLE';

    return new Response(
      JSON.stringify({
        domain,
        available,
        status: response.data.DomainInfo.domainAvailability,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Domain check error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check domain availability' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 