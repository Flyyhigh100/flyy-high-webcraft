-- Tighten RLS on user_sessions to prevent public access
-- 1) Remove overly permissive policy
DROP POLICY IF EXISTS "Service role can manage sessions" ON public.user_sessions;

-- 2) Ensure users can only read their own session rows
CREATE POLICY IF NOT EXISTS "Users can view own sessions"
ON public.user_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Keep existing admin read access policy as-is:
-- "Admins can view all sessions" (already present)