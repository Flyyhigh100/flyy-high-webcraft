-- Performance optimization: Fix two issues
-- 1. Consolidate multiple SELECT policies on user_sessions into single policy
-- 2. Optimize rate_limits admin policy with (select auth.uid())

-- Consolidate user_sessions SELECT policies
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;

CREATE POLICY "Users can view own sessions, admins can view all"
ON public.user_sessions
FOR SELECT
TO authenticated
USING (
  -- Admins can see all sessions
  is_admin((select auth.uid()))
  OR
  -- Users can only see their own sessions
  ((select auth.uid()) = user_id)
);

-- Optimize rate_limits admin policy
DROP POLICY IF EXISTS "Admins can view rate limits" ON public.rate_limits;

CREATE POLICY "Admins can view rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (is_admin((select auth.uid())));