-- Phase 1: Add invite_token_hash column for Phase 3
ALTER TABLE public.client_invitations
ADD COLUMN IF NOT EXISTS invite_token_hash text;

CREATE INDEX IF NOT EXISTS idx_invite_token_hash ON public.client_invitations(invite_token_hash);

-- Phase 2: Create edge function rate limiting function
CREATE OR REPLACE FUNCTION public.check_edge_function_rate_limit(
  ip_addr text,
  endpoint_name text,
  max_requests integer,
  window_minutes integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_count integer;
BEGIN
  -- If no IP provided, allow the request
  IF ip_addr IS NULL OR ip_addr = 'unknown' THEN
    RETURN true;
  END IF;
  
  SELECT COALESCE(SUM(request_count), 0) INTO request_count
  FROM public.rate_limits
  WHERE ip_address = ip_addr::inet
    AND endpoint = endpoint_name
    AND window_start > (now() - (window_minutes || ' minutes')::interval);
  
  IF request_count >= max_requests THEN
    INSERT INTO public.security_logs (
      event_type, ip_address, success, details
    ) VALUES (
      'edge_function_rate_limit_exceeded',
      ip_addr::inet,
      false,
      jsonb_build_object(
        'endpoint', endpoint_name,
        'count', request_count,
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
$$;

-- Phase 1: Update RLS policy to include rate limiting for non-admin users
DROP POLICY IF EXISTS "Users can view own invitations, admins can view all" ON public.client_invitations;

CREATE POLICY "Users can view own invitations with rate limit, admins bypass"
ON public.client_invitations
FOR SELECT
TO authenticated
USING (
  -- Admins can view all without rate limiting
  is_admin(auth.uid())
  OR 
  -- Regular users must pass rate limit check AND email must match
  (
    lower(email) = lower((
      SELECT au.email::text 
      FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND au.email_confirmed_at IS NOT NULL
    ))
    AND check_invitation_query_rate_limit()
  )
);

-- Phase 5: Add automated cleanup function for old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limit_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete rate limit records older than 24 hours
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - interval '24 hours';
  
  -- Log the cleanup
  INSERT INTO public.security_logs (
    event_type, success, details
  ) VALUES (
    'rate_limit_cleanup',
    true,
    jsonb_build_object(
      'cleaned_at', now(),
      'records_deleted', (SELECT COUNT(*) FROM public.rate_limits WHERE window_start < now() - interval '24 hours')
    )
  );
END;
$$;