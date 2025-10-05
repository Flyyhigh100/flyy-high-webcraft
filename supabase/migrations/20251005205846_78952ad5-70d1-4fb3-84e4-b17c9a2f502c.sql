-- Create a rate limiting function specifically for client_invitations queries
CREATE OR REPLACE FUNCTION public.check_invitation_query_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  query_count integer;
  client_ip inet;
BEGIN
  -- Get client IP
  client_ip := inet_client_addr();
  
  -- If no IP (e.g., localhost), allow the query
  IF client_ip IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check queries in last 5 minutes for this IP and endpoint
  SELECT COALESCE(SUM(request_count), 0) INTO query_count
  FROM public.rate_limits
  WHERE ip_address = client_ip
    AND endpoint = 'invitation_query'
    AND window_start > (now() - interval '5 minutes');
  
  -- Allow max 10 invitation queries per 5 minutes per IP
  IF query_count >= 10 THEN
    -- Log suspicious activity
    INSERT INTO public.security_logs (
      event_type, user_id, ip_address, success, details
    ) VALUES (
      'rate_limit_exceeded', 
      auth.uid(), 
      client_ip, 
      false,
      jsonb_build_object(
        'endpoint', 'invitation_query', 
        'count', query_count,
        'limit', 10,
        'window', '5 minutes'
      )
    );
    
    RETURN false;
  END IF;
  
  -- Track this query
  INSERT INTO public.rate_limits (ip_address, endpoint, request_count, window_start)
  VALUES (client_ip, 'invitation_query', 1, now())
  ON CONFLICT (ip_address, endpoint) 
  DO UPDATE SET 
    request_count = rate_limits.request_count + 1,
    updated_at = now();
  
  RETURN true;
END;
$$;

-- Update the SELECT policy to include rate limiting
DROP POLICY IF EXISTS "Users can view own invitations by email" ON public.client_invitations;

CREATE POLICY "Users can view own invitations by email with rate limit"
ON public.client_invitations
FOR SELECT
TO authenticated
USING (
  check_invitation_query_rate_limit()
  AND lower(email) = lower((
    SELECT email::text 
    FROM auth.users 
    WHERE id = auth.uid()
  ))
);