-- Performance optimization: Consolidate multiple SELECT policies into single policy
-- Multiple permissive policies for the same action cause suboptimal performance

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.client_invitations;
DROP POLICY IF EXISTS "Users can view own invitations" ON public.client_invitations;

-- Create single consolidated SELECT policy with OR logic
-- This evaluates once instead of evaluating multiple policies
CREATE POLICY "Users can view own invitations, admins can view all"
ON public.client_invitations
FOR SELECT
TO authenticated
USING (
  -- Admins can see all invitations
  is_admin((select auth.uid()))
  OR
  -- Users can only see invitations sent to their verified email
  (
    lower(email) = lower((
      SELECT au.email::text
      FROM auth.users au
      WHERE au.id = (select auth.uid())
      AND au.email_confirmed_at IS NOT NULL
    ))
  )
);