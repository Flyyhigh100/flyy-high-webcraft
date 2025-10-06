-- Fix bithomie's account data
UPDATE websites 
SET 
  billing_cycle = 'yearly',
  next_payment_date = '2026-10-04'::timestamp with time zone,
  next_payment_amount = 120.00
WHERE url ILIKE '%bithomie%' OR name ILIKE '%bithomie%';