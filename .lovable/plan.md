
# Fix Contact Form IP Address Parsing Error

## Problem Identified
The contact form fails with "unable to send message" because:

1. The `x-forwarded-for` header contains multiple comma-separated IP addresses: `"104.136.70.243,104.136.70.243, 3.2.52.21"`
2. The code tries to insert this entire string into the `ip_address` column
3. PostgreSQL's `inet` type rejects the multi-IP string, causing a database error
4. The error cascades and the form submission fails

## Root Cause
When HTTP requests pass through multiple proxies (load balancers, CDNs, etc.), the `x-forwarded-for` header accumulates IP addresses in the format: `client_ip, proxy1_ip, proxy2_ip`. The current code doesn't parse this correctly.

## Solution
Extract only the **first IP address** from the header (which represents the original client). This is a simple string parsing fix.

---

## Technical Changes

**File: `supabase/functions/contact-form/index.ts`**

Update line 95 to parse the IP correctly:

```typescript
// Current (broken):
const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

// Fixed:
const forwardedFor = req.headers.get('x-forwarded-for');
const clientIP = forwardedFor 
  ? forwardedFor.split(',')[0].trim() 
  : (req.headers.get('x-real-ip') || '127.0.0.1');
```

Also update line 233 (in the catch block) with the same fix:

```typescript
// Current (broken):
const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

// Fixed:
const forwardedFor = req.headers.get('x-forwarded-for');
const clientIP = forwardedFor 
  ? forwardedFor.split(',')[0].trim() 
  : (req.headers.get('x-real-ip') || '127.0.0.1');
```

---

## Why This Works
- The first IP in `x-forwarded-for` is always the original client IP
- `.split(',')[0]` extracts just the first IP
- `.trim()` removes any whitespace
- PostgreSQL's `inet` type will now receive a valid single IP address

---

## After Implementation
1. The edge function will be redeployed automatically
2. Test the contact form by submitting a message
3. Verify the email arrives at kofi@sydevault.com
