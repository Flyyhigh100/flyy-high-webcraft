-- Step 1: Drop the existing non-unique index (it will be superseded by the unique constraint)
DROP INDEX IF EXISTS public.idx_rate_limits_ip_endpoint;

-- Step 2: Add the UNIQUE constraint that ON CONFLICT needs
ALTER TABLE public.rate_limits 
ADD CONSTRAINT rate_limits_ip_endpoint_key UNIQUE (ip_address, endpoint);

-- Step 3: Replace check_edge_function_rate_limit with window-aware logic
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
  current_count integer;
  window_interval interval;
BEGIN
  window_interval := (window_minutes || ' minutes')::interval;

  INSERT INTO public.rate_limits (ip_address, endpoint, request_count, window_start, updated_at)
  VALUES (ip_addr::inet, endpoint_name, 1, now(), now())
  ON CONFLICT (ip_address, endpoint) DO UPDATE
  SET
    request_count = CASE
      WHEN rate_limits.window_start + window_interval < now() THEN 1
      ELSE rate_limits.request_count + 1
    END,
    window_start = CASE
      WHEN rate_limits.window_start + window_interval < now() THEN now()
      ELSE rate_limits.window_start
    END,
    updated_at = now()
  RETURNING request_count INTO current_count;

  RETURN current_count <= max_requests;
END;
$$;

-- Step 4: Replace check_profile_query_rate_limit with window-aware logic (1 minute window, 10 requests)
CREATE OR REPLACE FUNCTION public.check_profile_query_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_ip text;
  current_count integer;
  window_interval interval := '1 minute'::interval;
  max_requests integer := 10;
BEGIN
  client_ip := coalesce(
    split_part(current_setting('request.headers', true)::json->>'x-forwarded-for', ',', 1),
    '0.0.0.0'
  );

  INSERT INTO public.rate_limits (ip_address, endpoint, request_count, window_start, updated_at)
  VALUES (client_ip::inet, 'profile_query', 1, now(), now())
  ON CONFLICT (ip_address, endpoint) DO UPDATE
  SET
    request_count = CASE
      WHEN rate_limits.window_start + window_interval < now() THEN 1
      ELSE rate_limits.request_count + 1
    END,
    window_start = CASE
      WHEN rate_limits.window_start + window_interval < now() THEN now()
      ELSE rate_limits.window_start
    END,
    updated_at = now()
  RETURNING request_count INTO current_count;

  RETURN current_count <= max_requests;
END;
$$;

-- Step 5: Replace check_invitation_query_rate_limit with window-aware logic (5 minute window, 20 requests)
CREATE OR REPLACE FUNCTION public.check_invitation_query_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_ip text;
  current_count integer;
  window_interval interval := '5 minutes'::interval;
  max_requests integer := 20;
BEGIN
  client_ip := coalesce(
    split_part(current_setting('request.headers', true)::json->>'x-forwarded-for', ',', 1),
    '0.0.0.0'
  );

  INSERT INTO public.rate_limits (ip_address, endpoint, request_count, window_start, updated_at)
  VALUES (client_ip::inet, 'invitation_query', 1, now(), now())
  ON CONFLICT (ip_address, endpoint) DO UPDATE
  SET
    request_count = CASE
      WHEN rate_limits.window_start + window_interval < now() THEN 1
      ELSE rate_limits.request_count + 1
    END,
    window_start = CASE
      WHEN rate_limits.window_start + window_interval < now() THEN now()
      ELSE rate_limits.window_start
    END,
    updated_at = now()
  RETURNING request_count INTO current_count;

  RETURN current_count <= max_requests;
END;
$$;