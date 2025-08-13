
-- Tighten RLS on public.subscriptions
-- 1) Remove the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

-- 2) Add explicit, least-privilege admin-only write policies (optional but recommended)
-- Insert
DROP POLICY IF EXISTS "Admins can insert subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can insert subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Update
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can update subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Delete
DROP POLICY IF EXISTS "Admins can delete subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can delete subscriptions"
ON public.subscriptions
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Notes:
-- - Existing SELECT policies remain:
--   * "Users can view own subscriptions" (USING auth.uid() = user_id)
--   * "Admins can view all subscriptions" (USING public.is_admin(auth.uid()))
-- - Service role key bypasses RLS; no special policy for it is required.
