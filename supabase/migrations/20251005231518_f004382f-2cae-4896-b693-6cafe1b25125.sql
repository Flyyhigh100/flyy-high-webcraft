-- Performance optimization: Fix two issues
-- 1. Optimize user_roles SELECT policy with (select auth.uid())
-- 2. Consolidate multiple SELECT policies on subscriptions into single policy

-- Fix user_roles policy
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

-- Consolidate subscriptions SELECT policies
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscriptions, admins can view all"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  -- Admins can see all subscriptions
  is_admin((select auth.uid()))
  OR
  -- Users can only see their own subscriptions
  ((select auth.uid()) = user_id)
);