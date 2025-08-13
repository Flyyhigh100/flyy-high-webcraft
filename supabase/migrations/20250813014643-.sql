-- Fix RLS on user_sessions
-- 1) Remove overly permissive policy
DROP POLICY IF EXISTS "Service role can manage sessions" ON public.user_sessions;

-- 2) Replace with least-privilege user read access
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions"
ON public.user_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admin read policy remains unchanged