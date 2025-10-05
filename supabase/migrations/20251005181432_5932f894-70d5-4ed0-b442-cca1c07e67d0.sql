-- Drop the ineffective "Deny unauthenticated access" policy
DROP POLICY IF EXISTS "Deny unauthenticated access to client_invitations" ON public.client_invitations;

-- Drop existing SELECT policies to recreate them with better security
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.client_invitations;
DROP POLICY IF EXISTS "Users can view own invitations via token" ON public.client_invitations;

-- Recreate SELECT policies with explicit restrictions
-- Only admins can view all invitations
CREATE POLICY "Admins can view all invitations"
ON public.client_invitations
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Users can ONLY view invitations where their email matches (case-insensitive)
CREATE POLICY "Users can view own invitations by email"
ON public.client_invitations
FOR SELECT
TO authenticated
USING (
  lower(email) = lower((
    SELECT email::text 
    FROM auth.users 
    WHERE id = auth.uid()
  ))
);

-- Strengthen UPDATE policy to ensure users can only update their own invitations
DROP POLICY IF EXISTS "Users can accept own invitations" ON public.client_invitations;

CREATE POLICY "Users can accept own invitations"
ON public.client_invitations
FOR UPDATE
TO authenticated
USING (
  lower(email) = lower((
    SELECT email::text 
    FROM auth.users 
    WHERE id = auth.uid()
  ))
  AND status = 'pending'
  AND expires_at > now()
)
WITH CHECK (
  status = 'used'
  AND used_at IS NOT NULL
  AND lower(email) = lower((
    SELECT email::text 
    FROM auth.users 
    WHERE id = auth.uid()
  ))
);