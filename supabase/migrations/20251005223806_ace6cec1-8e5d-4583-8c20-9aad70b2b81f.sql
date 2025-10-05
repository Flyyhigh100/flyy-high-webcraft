-- Performance optimization: Prevent auth.uid() re-evaluation in subscriptions policies
-- Replace auth.uid() with (select auth.uid()) for better performance at scale

-- Drop existing policies on subscriptions table
DROP POLICY IF EXISTS "Admins can insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can delete subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

-- Recreate with optimized auth.uid() calls

CREATE POLICY "Admins can insert subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (is_admin((select auth.uid())));

CREATE POLICY "Admins can update subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (is_admin((select auth.uid())))
WITH CHECK (is_admin((select auth.uid())));

CREATE POLICY "Admins can delete subscriptions"
ON public.subscriptions
FOR DELETE
TO authenticated
USING (is_admin((select auth.uid())));

CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (is_admin((select auth.uid())));

CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

-- Add comments explaining the optimization
COMMENT ON POLICY "Admins can insert subscriptions" ON public.subscriptions IS
'Optimized: Uses (select auth.uid()) to evaluate the user ID once per query instead of once per row.';

COMMENT ON POLICY "Admins can update subscriptions" ON public.subscriptions IS
'Optimized: Uses (select auth.uid()) to evaluate the user ID once per query instead of once per row.';

COMMENT ON POLICY "Admins can delete subscriptions" ON public.subscriptions IS
'Optimized: Uses (select auth.uid()) to evaluate the user ID once per query instead of once per row.';

COMMENT ON POLICY "Admins can view all subscriptions" ON public.subscriptions IS
'Optimized: Uses (select auth.uid()) to evaluate the user ID once per query instead of once per row.';

COMMENT ON POLICY "Users can view own subscriptions" ON public.subscriptions IS
'Optimized: Uses (select auth.uid()) to evaluate the user ID once per query instead of once per row.';