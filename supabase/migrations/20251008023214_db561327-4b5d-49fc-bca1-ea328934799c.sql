-- Remove the potentially confusing restrictive policy and replace with explicit role-based policies
DROP POLICY IF EXISTS "Deny all anonymous access to client invitations" ON public.client_invitations;

-- Ensure the table has RLS enabled
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

-- Force row level security even for table owner
ALTER TABLE public.client_invitations FORCE ROW LEVEL SECURITY;

-- Recreate all policies with explicit authentication requirements

-- SELECT: Only authenticated users (admins or matching email with rate limit)
DROP POLICY IF EXISTS "Users can view own invitations with rate limit, admins bypass" ON public.client_invitations;
CREATE POLICY "Users can view own invitations with rate limit, admins bypass"
ON public.client_invitations
FOR SELECT
TO authenticated  -- Explicitly only authenticated users
USING (
  -- Admins can view all without rate limiting
  is_admin(auth.uid())
  OR 
  -- Regular users must pass rate limit check AND email must match
  (
    lower(email) = lower((
      SELECT au.email::text 
      FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND au.email_confirmed_at IS NOT NULL
    ))
    AND check_invitation_query_rate_limit()
  )
);

-- INSERT: Only admins
DROP POLICY IF EXISTS "Admins can create invitations" ON public.client_invitations;
CREATE POLICY "Admins can create invitations"
ON public.client_invitations
FOR INSERT
TO authenticated  -- Explicitly only authenticated users
WITH CHECK (is_admin(auth.uid()));

-- UPDATE: Admins can update all, users can accept own invitations
DROP POLICY IF EXISTS "Admins can update all, users can accept own invitations" ON public.client_invitations;
CREATE POLICY "Admins can update all, users can accept own invitations"
ON public.client_invitations
FOR UPDATE
TO authenticated  -- Explicitly only authenticated users
USING (
  is_admin(auth.uid()) 
  OR 
  (
    lower(email) = lower((
      SELECT au.email::text 
      FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND au.email_confirmed_at IS NOT NULL
    ))
    AND status = 'pending'
    AND expires_at > now()
  )
)
WITH CHECK (
  is_admin(auth.uid()) 
  OR 
  (
    status = 'used'
    AND used_at IS NOT NULL
    AND lower(email) = lower((
      SELECT au.email::text 
      FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND au.email_confirmed_at IS NOT NULL
    ))
  )
);

-- DELETE: Only admins
DROP POLICY IF EXISTS "Admins can delete invitations" ON public.client_invitations;
CREATE POLICY "Admins can delete invitations"
ON public.client_invitations
FOR DELETE
TO authenticated  -- Explicitly only authenticated users
USING (is_admin(auth.uid()));

-- Add explicit DENY policy for anonymous users as the first policy
CREATE POLICY "Block all anonymous access to client invitations"
ON public.client_invitations
AS RESTRICTIVE  -- This is an AND condition with other policies
FOR ALL
TO anon  -- Explicitly target anonymous role
USING (false);  -- Always deny

-- Verify no default grants exist for anon role
REVOKE ALL ON public.client_invitations FROM anon;
REVOKE ALL ON public.client_invitations FROM public;