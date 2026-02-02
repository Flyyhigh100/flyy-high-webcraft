CREATE OR REPLACE FUNCTION public.check_edge_function_rate_limit(
  ip_addr text, 
  endpoint_name text, 
  max_requests integer, 
  window_minutes integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_count integer;
BEGIN
  IF ip_addr IS NULL OR ip_addr = 'unknown' THEN
    RETURN true;
  END IF;
  
  SELECT COALESCE(SUM(rate_limits.request_count), 0) INTO current_count
  FROM public.rate_limits
  WHERE rate_limits.ip_address = ip_addr::inet
    AND rate_limits.endpoint = endpoint_name
    AND rate_limits.window_start > (now() - (window_minutes || ' minutes')::interval);
  
  IF current_count >= max_requests THEN
    INSERT INTO public.security_logs (
      event_type, ip_address, success, details
    ) VALUES (
      'edge_function_rate_limit_exceeded',
      ip_addr::inet,
      false,
      jsonb_build_object(
        'endpoint', endpoint_name,
        'count', current_count,
        'limit', max_requests,
        'window_minutes', window_minutes
      )
    );
    RETURN false;
  END IF;
  
  INSERT INTO public.rate_limits (ip_address, endpoint, request_count, window_start)
  VALUES (ip_addr::inet, endpoint_name, 1, now())
  ON CONFLICT (ip_address, endpoint) 
  DO UPDATE SET 
    request_count = rate_limits.request_count + 1,
    updated_at = now();
  
  RETURN true;
END;
$function$