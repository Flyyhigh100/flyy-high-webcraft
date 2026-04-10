CREATE OR REPLACE FUNCTION public.update_payment_statuses()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE websites 
  SET payment_status = CASE 
    WHEN payment_status = 'pending_initial_payment' THEN 'pending_initial_payment'
    
    WHEN domain_live_date IS NOT NULL 
      AND CURRENT_DATE <= (domain_live_date::DATE + (grace_period_days || ' days')::INTERVAL)::DATE
      THEN 'current'
    
    WHEN next_payment_date IS NULL OR next_payment_date::DATE > CURRENT_DATE THEN 'current'
    WHEN CURRENT_DATE - next_payment_date::DATE BETWEEN 1 AND 3 THEN 'overdue_3d'
    WHEN CURRENT_DATE - next_payment_date::DATE BETWEEN 4 AND 7 THEN 'overdue_7d'
    WHEN CURRENT_DATE - next_payment_date::DATE BETWEEN 8 AND 14 THEN 'overdue_14d'
    WHEN CURRENT_DATE - next_payment_date::DATE BETWEEN 15 AND 30 THEN 'overdue_30d'
    WHEN CURRENT_DATE - next_payment_date::DATE > 30 THEN 'suspended'
    ELSE payment_status
  END,
  grace_period_end_date = CASE 
    WHEN next_payment_date IS NOT NULL AND CURRENT_DATE > next_payment_date::DATE AND grace_period_end_date IS NULL
    THEN (next_payment_date::DATE + 30)
    ELSE grace_period_end_date
  END,
  suspension_date = CASE 
    WHEN CURRENT_DATE - next_payment_date::DATE > 30 AND suspension_date IS NULL
    THEN CURRENT_TIMESTAMP
    ELSE suspension_date
  END
  WHERE next_payment_date IS NOT NULL OR payment_status = 'pending_initial_payment';
END;
$function$;