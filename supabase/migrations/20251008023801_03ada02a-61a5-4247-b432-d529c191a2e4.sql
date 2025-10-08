-- Security Fix: Lock down rate_limits table access
-- Problem: Current policies don't properly block anonymous and non-admin authenticated users
-- Solution: Add restrictive policies and revoke default grants

-- Step 1: Drop the ineffective anonymous blocking policy
DROP POLICY IF EXISTS "Deny all anonymous access to rate limits" ON public.rate_limits;

-- Step 2: Revoke all default grants to prevent any unauthorized access
REVOKE ALL ON public.rate_limits FROM public;
REVOKE ALL ON public.rate_limits FROM anon;
REVOKE ALL ON public.rate_limits FROM authenticated;

-- Step 3: Create restrictive policy to explicitly block anonymous users
CREATE POLICY "Block all anonymous access to rate_limits"
ON public.rate_limits
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Step 4: Create restrictive policy to block non-admin authenticated users
CREATE POLICY "Block non-admin authenticated access to rate_limits"
ON public.rate_limits
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- Step 5: Verify admin SELECT policy exists (should already exist)
-- This is permissive and allows admins to view rate limits
DROP POLICY IF EXISTS "Admins can view rate limits" ON public.rate_limits;
CREATE POLICY "Admins can view rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Step 6: Verify service_role policy exists (should already exist)
-- This allows edge functions to manage rate limits
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Log the security enhancement
INSERT INTO public.security_logs (
  event_type,
  success,
  details
) VALUES (
  'rate_limits_security_hardening',
  true,
  jsonb_build_object(
    'action', 'Restricted rate_limits table access to admins and service_role only',
    'timestamp', now(),
    'blocked_roles', ARRAY['anon', 'authenticated_non_admin']
  )
);