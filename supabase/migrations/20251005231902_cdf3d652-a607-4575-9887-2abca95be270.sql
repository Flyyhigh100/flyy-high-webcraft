-- Performance optimization: Fix two issues
-- 1. Optimize security_logs admin policy with (select auth.uid())
-- 2. Consolidate multiple SELECT policies on user_roles

-- Fix security_logs admin policy
DROP POLICY IF EXISTS "Admins can view all security logs" ON public.security_logs;

CREATE POLICY "Admins can view all security logs"
ON public.security_logs
FOR SELECT
TO authenticated
USING (is_admin((select auth.uid())));

-- Consolidate user_roles SELECT policies
-- The "Admins can manage all roles" FOR ALL policy also covers SELECT, causing multiple policy evaluations
-- Solution: Keep FOR ALL for other operations, consolidate SELECT into single policy

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Create single consolidated SELECT policy
CREATE POLICY "Users can view own roles, admins can view all"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  -- Admins can see all roles
  has_role((select auth.uid()), 'admin'::app_role)
  OR
  -- Users can only see their own roles
  ((select auth.uid()) = user_id)
);