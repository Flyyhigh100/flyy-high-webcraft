

## Problem Analysis

I found **3 critical bugs** causing the errors you're seeing across the admin payment tools:

### Bug 1: SQL Type Mismatch in `update_payment_statuses` (the error in your screenshot)
The database function `update_payment_statuses` compares `CURRENT_DATE - next_payment_date` with integers (e.g., `BETWEEN 1 AND 3`). Since `next_payment_date` is a `timestamp with time zone`, this subtraction produces an `interval`, not an integer. PostgreSQL cannot compare an `interval` to an `integer`, causing the error: **"operator does not exist: interval >= integer"**.

This breaks both "Update Payment Statuses" and "Run Payment Check & Send Reminders" (which calls this function first).

**Fix:** Cast `next_payment_date` to `DATE` so the subtraction produces an integer (number of days):
```sql
WHEN CURRENT_DATE - next_payment_date::DATE BETWEEN 1 AND 3 THEN 'overdue_3d'
```
Apply the same `::DATE` cast to all comparisons in the function, including the `domain_live_date` grace period check.

### Bug 2: `send-payment-reminder` Edge Function References Non-Existent Column
The function joins `profiles!websites_user_id_fkey(email)` but the `profiles` table has **no `email` column** (only `id`, `created_at`, `updated_at`, `marketing_opt_in`). This causes every reminder send to fail.

**Fix:** Fetch the user's email from `auth.users` via the admin API instead of joining profiles. Use `supabaseClient.auth.admin.getUserById(website.user_id)` to get the email.

### Bug 3: Client-Side Admin API Calls in `EnhancedPaymentReminders`
The component calls `supabase.auth.admin.listUsers()` from the browser. The admin API requires the service role key and **does not work from client-side code**. This causes the email lookup to silently fail, showing "No email" for all clients.

**Fix:** Use the existing `admin-service` edge function (which already fetches auth users with the service role key) or call `get_user_emails_bulk` RPC (which already exists and is security-definer).

---

## Implementation Plan

### Step 1: Fix `update_payment_statuses` SQL function
Create a migration that replaces the function, casting `next_payment_date` to `DATE` in all arithmetic comparisons so `CURRENT_DATE - next_payment_date::DATE` returns an integer.

### Step 2: Fix `send-payment-reminder` Edge Function
Remove the broken `profiles` join. Instead, look up the user email using `supabaseClient.auth.admin.getUserById(website.user_id)` and extract the email from the response.

### Step 3: Fix `EnhancedPaymentReminders` component
Replace the client-side `supabase.auth.admin.listUsers()` call with a call to the existing `get_user_emails_bulk` RPC function, which runs as security definer and is accessible to admins.

### Step 4: Deploy and verify
Deploy the updated edge function and run the migration.

