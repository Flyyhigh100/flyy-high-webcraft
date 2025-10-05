-- Security Fix: Remove direct email-based queries, enforce token-based access only
-- Users should only access invitations via secure edge function with token

-- Drop the existing user SELECT policy that allows email-based queries
DROP POLICY IF EXISTS "Users can view own invitations with verified email" ON public.client_invitations;

-- Users should NOT be able to directly query client_invitations table
-- All user access must go through the get-invitation-details edge function which:
-- 1. Uses service role to bypass RLS
-- 2. Validates the secure token
-- 3. Returns sanitized data (no payment amounts)
-- 4. Checks expiration dates

-- Keep only the admin policies
-- (Admins can view all invitations, Users can accept via edge function UPDATE policy)

-- Add a comment explaining the security model
COMMENT ON TABLE public.client_invitations IS 
'Security Model: Users access invitations ONLY via token-based edge function (get-invitation-details). 
Direct SELECT queries are restricted to admins. This prevents email enumeration attacks and protects sensitive business data.';

-- Verify admin can still view all invitations
-- (This policy should already exist, but let's ensure it's there)
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.client_invitations;
CREATE POLICY "Admins can view all invitations"
ON public.client_invitations
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Update the RPC function to return data only through the secure invitation flow
-- Users should check their invitation status through get_user_invitation_status RPC
-- which is already secured and doesn't expose sensitive details unless they actually accepted it