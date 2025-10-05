-- Security enhancement: Add explicit DENY policies to rate_limits table
-- This prevents any potential unauthorized access to security-sensitive rate limiting data

-- Ensure RLS is enabled
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Add explicit DENY policy for anonymous users
CREATE POLICY "Deny all anonymous access to rate limits"
ON public.rate_limits
FOR ALL
TO anon
USING (false);

-- Add explicit DENY policy for non-admin authenticated users (for SELECT)
-- Note: Service role bypasses RLS, so this won't affect it
CREATE POLICY "Deny non-admin user access to rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (is_admin((select auth.uid())));

-- Add security comment
COMMENT ON TABLE public.rate_limits IS
'SECURITY: Contains IP addresses and request patterns for rate limiting. Access strictly restricted to admins and service role only. Public/anonymous access explicitly denied to prevent attackers from analyzing security measures.';

COMMENT ON POLICY "Deny all anonymous access to rate limits" ON public.rate_limits IS
'Security policy: Explicitly denies all anonymous access to prevent security pattern analysis.';

COMMENT ON POLICY "Deny non-admin user access to rate limits" ON public.rate_limits IS
'Security policy: Only admins can view rate limit data. Regular users are explicitly denied to prevent security pattern analysis.';