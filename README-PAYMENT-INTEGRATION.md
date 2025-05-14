# Bank of America Payment Integration

This document explains how to use the Bank of America payment integration API endpoint.

## Endpoint

```
POST /api/pay
```

## Request Format

Send a POST request with a JSON body containing:

```json
{
  "email": "customer@example.com",
  "plan": "basic" or "pro"
}
```

## Response Format

Successful response:
```json
{
  "success": true,
  "redirectUrl": "https://bank.com/payment/session/xyz123"
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Configuration

1. Create a `.env.local` file in the project root with your Bank of America API credentials:

```
BOA_API_KEY=your_bank_of_america_api_key_here
BOA_API_SECRET=your_bank_of_america_api_secret_here
```

2. Replace the placeholder values with your actual API credentials.

3. Make sure to add `.env.local` to your `.gitignore` file to avoid committing sensitive credentials.

## Security Considerations

- All payment processing happens server-side.
- API credentials are stored as environment variables and never exposed to clients.
- Input validation is performed before processing any payment.
- Detailed error messages are logged server-side but not exposed to clients. 