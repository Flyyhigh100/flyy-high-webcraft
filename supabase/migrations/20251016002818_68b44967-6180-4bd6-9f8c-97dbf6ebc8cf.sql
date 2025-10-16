-- Phase 1: Fix SQL Type Casting Error in update_payment_statuses()
-- Problem: Type mismatch when comparing CURRENT_DATE with interval calculation
-- Solution: Explicitly cast domain_live_date to DATE before interval addition

CREATE OR REPLACE FUNCTION public.update_payment_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update websites based on next_payment_date with grace period support
  UPDATE websites 
  SET payment_status = CASE 
    -- Don't mark pending initial payment as overdue
    WHEN payment_status = 'pending_initial_payment' THEN 'pending_initial_payment'
    
    -- Grace period for live domain switches (FIXED TYPE CASTING)
    WHEN domain_live_date IS NOT NULL 
      AND CURRENT_DATE <= (domain_live_date::DATE + (grace_period_days || ' days')::INTERVAL)
      THEN 'current'
    
    -- Standard overdue calculation
    WHEN next_payment_date IS NULL OR next_payment_date > CURRENT_DATE THEN 'current'
    WHEN CURRENT_DATE - next_payment_date BETWEEN 1 AND 3 THEN 'overdue_3d'
    WHEN CURRENT_DATE - next_payment_date BETWEEN 4 AND 7 THEN 'overdue_7d'
    WHEN CURRENT_DATE - next_payment_date BETWEEN 8 AND 14 THEN 'overdue_14d'
    WHEN CURRENT_DATE - next_payment_date BETWEEN 15 AND 30 THEN 'overdue_30d'
    WHEN CURRENT_DATE - next_payment_date > 30 THEN 'suspended'
    ELSE payment_status
  END,
  grace_period_end_date = CASE 
    WHEN next_payment_date IS NOT NULL AND CURRENT_DATE > next_payment_date AND grace_period_end_date IS NULL
    THEN next_payment_date + INTERVAL '30 days'
    ELSE grace_period_end_date
  END,
  suspension_date = CASE 
    WHEN CURRENT_DATE - next_payment_date > 30 AND suspension_date IS NULL
    THEN CURRENT_TIMESTAMP
    ELSE suspension_date
  END
  WHERE next_payment_date IS NOT NULL OR payment_status = 'pending_initial_payment';
END;
$function$;