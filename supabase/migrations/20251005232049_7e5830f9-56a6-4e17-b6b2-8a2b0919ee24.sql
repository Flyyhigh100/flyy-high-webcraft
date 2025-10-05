-- Performance optimization: Fix redundant policies on user_roles
-- Problem: "Admins can manage all roles" (FOR ALL) duplicates SELECT with the consolidated SELECT policy
-- Solution: Replace FOR ALL with separate INSERT, UPDATE, DELETE policies

-- Drop the FOR ALL policy that causes duplication
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create separate policies for INSERT, UPDATE, DELETE (optimized with select auth.uid())
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role((select auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role((select auth.uid()), 'admin'::app_role));

-- The consolidated SELECT policy "Users can view own roles, admins can view all" remains
-- and now handles all SELECT operations without duplication