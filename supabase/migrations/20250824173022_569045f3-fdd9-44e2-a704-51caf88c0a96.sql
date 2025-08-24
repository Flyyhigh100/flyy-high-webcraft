-- First let's check the current RLS policies on user_sessions
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_sessions';

-- Now let's add proper RLS policies for user_sessions to allow inserts/updates
CREATE POLICY "Allow insert user sessions" ON public.user_sessions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update user sessions" ON public.user_sessions
FOR UPDATE
USING (true);

-- Also let's ensure we fetch all payment statuses in admin, not just completed ones
-- Check current payment data
SELECT status, count(*) FROM payments GROUP BY status;