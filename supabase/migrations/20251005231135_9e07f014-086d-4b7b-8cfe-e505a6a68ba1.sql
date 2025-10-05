-- Performance optimization: Remove redundant DELETE policy on user_roles
-- The "Admins can manage all roles" policy (FOR ALL) already covers DELETE operations
-- Having both causes unnecessary performance overhead

-- Drop the redundant DELETE-specific policy
DROP POLICY IF EXISTS "Deny non-admin DELETE on user_roles" ON public.user_roles;

-- The "Admins can manage all roles" policy remains and covers all operations including DELETE
-- No need to recreate - it's already in place and handles DELETE operations efficiently