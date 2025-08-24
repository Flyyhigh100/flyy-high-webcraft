-- Tighten RLS on user_sessions to prevent arbitrary inserts/updates
BEGIN;

-- Ensure RLS is enabled
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Remove overly permissive policies
DROP POLICY IF EXISTS "Allow insert user sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow update user sessions" ON public.user_sessions;

-- Allow users to insert only their own session rows
CREATE POLICY "Users can insert their own sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own session rows and keep ownership intact
CREATE POLICY "Users can update their own sessions"
ON public.user_sessions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMIT;