-- Performance optimization: Replace auth.uid() with (select auth.uid()) in user_sessions RLS policies
-- This prevents unnecessary re-evaluation of auth.uid() for each row

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;

-- Recreate policies with optimized auth.uid() calls

CREATE POLICY "Admins can view all sessions"
ON public.user_sessions
FOR SELECT
TO authenticated
USING (is_admin((select auth.uid())));

CREATE POLICY "Users can insert their own sessions"
ON public.user_sessions
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.user_sessions
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own sessions"
ON public.user_sessions
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);