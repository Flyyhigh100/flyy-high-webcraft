-- ============================================================
-- COMPREHENSIVE SECURITY HARDENING FOR PROFILES TABLE
-- Phase 1: Remove email from profiles (CRITICAL)
-- Phase 2: Rate limiting on profile access (HIGH)
-- Phase 3: Security logging for profile access (HIGH)
-- Phase 4: Restrict marketing_opt_in visibility (MEDIUM)
-- ============================================================

-- Phase 1: Create secure helper function for admins to get user emails from auth.users
CREATE OR REPLACE FUNCTION public.get_user_email_by_id(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- Only admins can call this
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Get email from auth.users
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = _user_id;
  
  RETURN user_email;
END;
$$;

-- Phase 1: Create helper function to get multiple user emails (for bulk operations)
CREATE OR REPLACE FUNCTION public.get_user_emails_bulk(user_ids uuid[])
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Get emails from auth.users for all provided user IDs
  RETURN QUERY
  SELECT id, auth.users.email
  FROM auth.users
  WHERE id = ANY(user_ids);
END;
$$;

-- Phase 2: Rate limiting function for profile queries
CREATE OR REPLACE FUNCTION public.check_profile_query_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  
  -- Check queries in last minute for this IP and endpoint
  SELECT COALESCE(SUM(request_count), 0) INTO query_count
  FROM public.rate_limits
  WHERE ip_address = client_ip
    AND endpoint = 'profile_query'
    AND window_start > (now() - interval '1 minute');
  
  -- Allow max 20 profile queries per minute per IP
  IF query_count >= 20 THEN
    -- Log suspicious activity
    INSERT INTO public.security_logs (
      event_type, user_id, ip_address, success, details
    ) VALUES (
      'rate_limit_exceeded', 
      auth.uid(), 
      client_ip, 
      false,
      jsonb_build_object(
        'endpoint', 'profile_query', 
        'count', query_count,
        'limit', 20
      )
    );
    
    RETURN false;
  END IF;
  
  -- Track this query
  INSERT INTO public.rate_limits (ip_address, endpoint, request_count, window_start)
  VALUES (client_ip, 'profile_query', 1, now())
  ON CONFLICT (ip_address, endpoint) 
  DO UPDATE SET 
    request_count = rate_limits.request_count + 1,
    updated_at = now();
  
  RETURN true;
END;
$$;

-- Phase 3: Security logging function for profile access
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log non-admin access to prevent noise
  IF NOT public.is_admin(auth.uid()) THEN
    INSERT INTO public.security_logs (
      event_type,
      user_id,
      ip_address,
      success,
      details
    ) VALUES (
      'profile_access',
      auth.uid(),
      inet_client_addr(),
      true,
      jsonb_build_object(
        'accessed_profile_id', NEW.id,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Phase 4: Create function for users to get their own sanitized profile
CREATE OR REPLACE FUNCTION public.get_own_profile()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  role text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.role,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$$;

-- Phase 4: Create admin view for full profile access with emails
CREATE OR REPLACE VIEW admin_profiles_view AS
SELECT 
  p.id,
  p.user_id,
  p.role,
  p.created_at,
  p.updated_at,
  p.marketing_opt_in,
  p.marketing_updated_at,
  u.email,
  u.email_confirmed_at,
  u.last_sign_in_at,
  u.created_at as auth_created_at
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE public.is_admin(auth.uid());

-- Update RLS policies to include rate limiting
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile with rate limit" ON profiles;

CREATE POLICY "Users can view own profile with rate limit"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  AND public.check_profile_query_rate_limit()
);

-- Phase 1: Remove email column from profiles table (CRITICAL SECURITY FIX)
-- This eliminates unnecessary PII storage and prevents enumeration attacks
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Add comments for documentation
COMMENT ON FUNCTION public.get_user_email_by_id IS 'Admin-only function to securely retrieve user email from auth.users';
COMMENT ON FUNCTION public.get_user_emails_bulk IS 'Admin-only function to retrieve multiple user emails in bulk';
COMMENT ON FUNCTION public.check_profile_query_rate_limit IS 'Rate limiting function to prevent profile enumeration attacks (20 queries/minute)';
COMMENT ON FUNCTION public.log_profile_access IS 'Logs non-admin profile access for security monitoring';
COMMENT ON VIEW admin_profiles_view IS 'Admin-only view providing full profile data including emails from auth.users';