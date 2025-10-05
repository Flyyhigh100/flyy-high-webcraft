-- Security fix: Prevent unauthorized access to client_invitations
-- Add explicit policies to protect email addresses and invitation tokens

-- Ensure RLS is enabled
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

-- Add explicit DENY policy for anonymous users
CREATE POLICY "Deny all anonymous access to client invitations"
ON public.client_invitations
FOR ALL
TO anon
USING (false);

-- Add policy allowing authenticated users to view only their own invitations
-- Users can only see invitations where their verified email matches the invitation email
CREATE POLICY "Users can view own invitations"
ON public.client_invitations
FOR SELECT
TO authenticated
USING (
  lower(email) = lower((
    SELECT au.email::text
    FROM auth.users au
    WHERE au.id = (select auth.uid())
    AND au.email_confirmed_at IS NOT NULL
  ))
);

-- Add security comment
COMMENT ON TABLE public.client_invitations IS
'SECURITY: Contains sensitive customer email addresses and invitation tokens. Access strictly controlled: admins can view/manage all invitations, authenticated users can only view invitations matching their verified email address, anonymous access explicitly denied.';

COMMENT ON POLICY "Deny all anonymous access to client invitations" ON public.client_invitations IS
'Security policy: Explicitly denies all anonymous access to prevent email harvesting and token theft.';

COMMENT ON POLICY "Users can view own invitations" ON public.client_invitations IS
'Security policy: Authenticated users with verified email can only view invitations sent to their email address. Prevents cross-user data access.';