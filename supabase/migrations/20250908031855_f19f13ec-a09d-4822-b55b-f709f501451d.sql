
-- 1) Enforce RLS and FORCE RLS on sensitive tables
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invitations FORCE ROW LEVEL SECURITY;

ALTER TABLE public.project_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_inquiries FORCE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- 2) Standardize client_invitations policies to use is_admin(auth.uid())
DROP POLICY IF EXISTS "Admins can create invitations" ON public.client_invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON public.client_invitations;
DROP POLICY IF EXISTS "Admins can delete invitations" ON public.client_invitations;
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.client_invitations;

CREATE POLICY "Admins can create invitations"
  ON public.client_invitations
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update invitations"
  ON public.client_invitations
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete invitations"
  ON public.client_invitations
  FOR DELETE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all invitations"
  ON public.client_invitations
  FOR SELECT
  USING (is_admin(auth.uid()));

-- 3) Helpful indexes (no access change; performance only)
CREATE INDEX IF NOT EXISTS client_invitations_email_idx ON public.client_invitations (email);
CREATE INDEX IF NOT EXISTS client_invitations_invite_token_idx ON public.client_invitations (invite_token);
CREATE INDEX IF NOT EXISTS client_invitations_status_idx ON public.client_invitations (status);
