-- Performance optimization: Remove redundant UPDATE policy on user_roles
-- The "Admins can manage all roles" policy (FOR ALL) already covers UPDATE operations
-- Having both causes unnecessary performance overhead

-- Drop the redundant UPDATE-specific policy
DROP POLICY IF EXISTS "Deny non-admin UPDATE on user_roles" ON public.user_roles;

-- The "Admins can manage all roles" policy remains and covers all operations including UPDATE
-- No need to recreate - it's already in place and handles UPDATE operations efficiently