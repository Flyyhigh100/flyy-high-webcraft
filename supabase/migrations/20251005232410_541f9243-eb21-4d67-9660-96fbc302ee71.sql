-- Performance optimization: Consolidate multiple UPDATE policies into single policy
-- Multiple permissive policies for the same action cause suboptimal performance

-- Drop existing UPDATE policies
DROP POLICY IF EXISTS "Admins can update invitations" ON public.client_invitations;
DROP POLICY IF EXISTS "Users can accept own invitations" ON public.client_invitations;

-- Create single consolidated UPDATE policy
-- Combines admin full access with user restricted acceptance logic
CREATE POLICY "Admins can update all, users can accept own invitations"
ON public.client_invitations
FOR UPDATE
TO authenticated
USING (
  -- Admins can update any invitation
  is_admin((select auth.uid()))
  OR
  -- Users can only update if email matches, status is pending, and not expired
  (
    (lower(email) = lower((
      SELECT au.email::text
      FROM auth.users au
      WHERE au.id = (select auth.uid())
      AND au.email_confirmed_at IS NOT NULL
    )))
    AND (status = 'pending'::text)
    AND (expires_at > now())
  )
)
WITH CHECK (
  -- Admins can set any values
  is_admin((select auth.uid()))
  OR
  -- Users can only set to 'used' status with timestamp, and email still matches
  (
    (status = 'used'::text)
    AND (used_at IS NOT NULL)
    AND (lower(email) = lower((
      SELECT au.email::text
      FROM auth.users au
      WHERE au.id = (select auth.uid())
      AND au.email_confirmed_at IS NOT NULL
    )))
  )
);