-- Security verification and hardening for client_invitations table
-- Ensure absolutely no public read access to sensitive client data

-- First, let's verify RLS is enabled
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

-- Drop and recreate all policies with clear, restrictive logic
-- This ensures no gaps or overlapping permission issues

-- 1. DENY policies (executed first for clarity)
DROP POLICY IF EXISTS "Deny all anonymous access to client invitations" ON public.client_invitations;
CREATE POLICY "Deny all anonymous access to client invitations"
ON public.client_invitations
FOR ALL
TO anon
USING (false);

-- 2. Admin policies (full access for admins only)
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.client_invitations;
CREATE POLICY "Admins can view all invitations"
ON public.client_invitations
FOR SELECT
TO authenticated
USING (is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Admins can create invitations" ON public.client_invitations;
CREATE POLICY "Admins can create invitations"
ON public.client_invitations
FOR INSERT
TO authenticated
WITH CHECK (is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Admins can update invitations" ON public.client_invitations;
CREATE POLICY "Admins can update invitations"
ON public.client_invitations
FOR UPDATE
TO authenticated
USING (is_admin((select auth.uid())))
WITH CHECK (is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Admins can delete invitations" ON public.client_invitations;
CREATE POLICY "Admins can delete invitations"
ON public.client_invitations
FOR DELETE
TO authenticated
USING (is_admin((select auth.uid())));

-- 3. User policies (restricted access only to their own invitations)
DROP POLICY IF EXISTS "Users can view own invitations" ON public.client_invitations;
CREATE POLICY "Users can view own invitations"
ON public.client_invitations
FOR SELECT
TO authenticated
USING (
  -- Users can only see invitations sent to their verified email
  lower(email) = lower((
    SELECT au.email::text
    FROM auth.users au
    WHERE au.id = (select auth.uid())
    AND au.email_confirmed_at IS NOT NULL
  ))
);

DROP POLICY IF EXISTS "Users can accept own invitations" ON public.client_invitations;
CREATE POLICY "Users can accept own invitations"
ON public.client_invitations
FOR UPDATE
TO authenticated
USING (
  -- Can only update if email matches verified user email, status is pending, and not expired
  (lower(email) = lower((
    SELECT au.email::text
    FROM auth.users au
    WHERE au.id = (select auth.uid())
    AND au.email_confirmed_at IS NOT NULL
  )))
  AND (status = 'pending'::text)
  AND (expires_at > now())
)
WITH CHECK (
  -- Can only set to 'used' status with timestamp, and email still matches
  (status = 'used'::text)
  AND (used_at IS NOT NULL)
  AND (lower(email) = lower((
    SELECT au.email::text
    FROM auth.users au
    WHERE au.id = (select auth.uid())
    AND au.email_confirmed_at IS NOT NULL
  )))
);

-- Add comprehensive security documentation
COMMENT ON TABLE public.client_invitations IS
'SECURITY CRITICAL: Contains sensitive client emails, business relationships, payment amounts, and invitation tokens. 
RLS POLICIES ENFORCED:
- Anonymous users: ALL operations explicitly DENIED
- Authenticated users: Can only SELECT/UPDATE invitations matching their verified email address
- Admins: Full access to all operations
NO PUBLIC READ ACCESS EXISTS. All access requires authentication and proper authorization.';

COMMENT ON COLUMN public.client_invitations.email IS 'Client email address - protected by RLS, only visible to invitation recipient and admins';
COMMENT ON COLUMN public.client_invitations.invite_token IS 'Invitation token - protected by RLS, only accessible to invitation recipient and admins';
COMMENT ON COLUMN public.client_invitations.next_payment_amount IS 'Payment amount - sensitive financial data, protected by RLS';