-- Performance optimization: Remove redundant INSERT policy on user_roles
-- The "Admins can insert roles" policy already restricts INSERT to admins only
-- Having a DENY policy on top causes unnecessary performance overhead

-- Drop the redundant DENY policy
DROP POLICY IF EXISTS "Deny non-admin INSERT on user_roles" ON public.user_roles;

-- The "Admins can insert roles" policy remains and efficiently handles all INSERT operations
-- Only admins can insert, so the deny policy is redundant