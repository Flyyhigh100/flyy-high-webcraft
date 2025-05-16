# Support and Payment API Integration

This document explains how to use the Support Ticketing system and Payment Tracking API.

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [Database Schema](#database-schema)
3. [Support Ticket API](#support-ticket-api)
4. [Payment API](#payment-api)
5. [Security Considerations](#security-considerations)

## Environment Configuration

Ensure the following environment variables are set in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The `SUPABASE_SERVICE_ROLE_KEY` is required for the admin-level operations that bypass Row Level Security (RLS). Never expose this key to the frontend.

## Database Schema

### Support Tickets Table

```sql
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Payments Table

```sql
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES websites(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'upcoming')),
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  plan_type TEXT NOT NULL,
  method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Support Ticket API

### Submit a Support Ticket

**Endpoint:** `POST /api/support/submit`

**Request Body:**
```json
{
  "siteId": "uuid-of-website",
  "subject": "Support ticket subject",
  "message": "Detailed description of issue"
}
```

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": "uuid",
    "site_id": "uuid-of-website",
    "subject": "Support ticket subject",
    "message": "Detailed description of issue",
    "status": "open",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### List All Support Tickets (Admin View)

**Endpoint:** `GET /api/support/list`

**Response:**
```json
{
  "success": true,
  "tickets": [
    {
      "id": "uuid",
      "site_id": "uuid-of-website",
      "subject": "Support ticket subject",
      "message": "Detailed description of issue",
      "status": "open",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "website": {
        "id": "uuid-of-website",
        "domain": "example.com",
        "user_id": "uuid-of-user"
      }
    },
    ...
  ]
}
```

## Payment API

### Get Payments for a Site

**Endpoint:** `GET /api/payments/site/:id`

**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": "uuid",
      "user_id": "uuid-of-user",
      "site_id": "uuid-of-website",
      "amount": 29.99,
      "status": "completed",
      "payment_date": "timestamp",
      "plan_type": "pro",
      "method": "credit_card",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    },
    ...
  ]
}
```

### Get Payment Graph Data

**Endpoint:** `GET /api/payments/graph`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "month": "2023-01",
      "total": 349.85
    },
    {
      "month": "2023-02",
      "total": 429.90
    },
    ...
  ]
}
```

### Add a Payment Manually

**Endpoint:** `POST /api/payments/add`

**Request Body:**
```json
{
  "siteId": "uuid-of-website",
  "amount": 29.99,
  "planType": "pro",
  "method": "manual",
  "paymentDate": "2023-09-01T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "user_id": "uuid-of-user",
    "site_id": "uuid-of-website",
    "amount": 29.99,
    "status": "completed",
    "payment_date": "2023-09-01T00:00:00Z",
    "plan_type": "pro",
    "method": "manual",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

## Security Considerations

1. **API Keys**: The Supabase service role key has admin privileges. It should only be used server-side and never exposed in client code or public repositories.

2. **Row Level Security (RLS)**: Both tables have RLS policies to restrict access:
   - Users can only see/manage their own tickets and payments
   - Admin users can see/manage all tickets and payments

3. **Input Validation**: All endpoints validate input data to prevent malicious inputs.

4. **Error Handling**: Error details are logged server-side but not exposed to clients. 