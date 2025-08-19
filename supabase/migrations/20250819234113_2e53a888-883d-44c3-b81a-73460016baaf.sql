-- Harden RLS for client_invitations to prevent email harvesting while preserving admin functionality
-- 1) Ensure RLS is enabled
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

-- 2) Replace the SELECT policy to use a security-definer helper and add granular access
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.client_invitations;

-- Admins can view everything
CREATE POLICY "Admins can view all invitations"
ON public.client_invitations
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Inviter (creator) can view their own invitations
CREATE POLICY "Inviters can view own invitations"
ON public.client_invitations
FOR SELECT
USING (invited_by = auth.uid());

-- Website owners can view invitations tied to their website
CREATE POLICY "Website owners can view invitations for their sites"
ON public.client_invitations
FOR SELECT
USING (
  site_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.websites w
    WHERE w.id = client_invitations.site_id
      AND w.user_id = auth.uid()
  )
);

-- Keep existing INSERT/UPDATE/DELETE admin policies unchanged