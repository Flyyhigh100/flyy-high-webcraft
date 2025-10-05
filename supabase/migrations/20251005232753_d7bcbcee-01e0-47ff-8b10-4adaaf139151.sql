-- Performance optimization: Fix two issues
-- 1. Consolidate multiple SELECT policies on profiles into single policy
-- 2. Remove redundant DENY policy on rate_limits (admin-only policy already restricts access)

-- Fix profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile with rate limit" ON public.profiles;

CREATE POLICY "Users can view own profile with rate limit, admins can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Admins can see all profiles
  is_admin((select auth.uid()))
  OR
  -- Users can only see their own profile with rate limiting
  (((select auth.uid()) = id) AND check_profile_query_rate_limit())
);

-- Fix rate_limits table
-- Drop the redundant deny policy since admin-only policy already restricts access
DROP POLICY IF EXISTS "Deny non-admin user access to rate limits" ON public.rate_limits;

-- The "Admins can view rate limits" policy remains and efficiently handles all SELECT operations