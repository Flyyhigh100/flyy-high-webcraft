-- Add billing_cycle column to websites table
ALTER TABLE websites 
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'));

-- Add stripe_subscription_id column to link to Stripe subscriptions
ALTER TABLE websites 
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_websites_stripe_subscription_id ON websites(stripe_subscription_id);

-- Fix bithomie's payment data (basic yearly plan)
-- Correct payment date: 2025-10-04 -> 2026-10-04 (one year from now)
-- Correct amount: $15 -> $120 (yearly total for basic plan)
UPDATE websites
SET 
  next_payment_date = '2026-10-04'::timestamp with time zone,
  next_payment_amount = 120.00,
  billing_cycle = 'yearly'
WHERE url = 'bithomiepr.com'
  OR name = 'bithomiepr.com';

-- Update any other websites that might have similar issues
-- Fix any basic plan websites with next_payment_date in October 2025 and amount = 15
UPDATE websites
SET 
  next_payment_date = next_payment_date + INTERVAL '1 year',
  next_payment_amount = 120.00,
  billing_cycle = 'yearly'
WHERE plan_type = 'basic'
  AND next_payment_amount = 15.00
  AND next_payment_date BETWEEN '2025-10-01' AND '2025-10-31'
  AND billing_cycle IS NULL;

-- Fix any pro plan websites with similar issues
UPDATE websites
SET 
  next_payment_date = next_payment_date + INTERVAL '1 year',
  next_payment_amount = 240.00,
  billing_cycle = 'yearly'
WHERE plan_type = 'pro'
  AND next_payment_amount = 30.00
  AND next_payment_date BETWEEN '2025-10-01' AND '2025-10-31'
  AND billing_cycle IS NULL;