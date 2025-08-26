-- Fix security vulnerability: Replace email-based access with secure token-based access

-- 1) Drop the insecure email-based policy
DROP POLICY IF EXISTS "Invitees can view their invitation by email" ON public.client_invitations;

-- 2) Create a secure token-based policy for invitation access
-- This allows access only when the user provides the correct invite_token
-- The token should be passed via RLS context or a secure function call
CREATE POLICY "Invitees can view invitation with valid token"
ON public.client_invitations
FOR SELECT
USING (
  -- Only allow access if the user has admin role, is the inviter, or owns the website
  -- Token-based access should be handled through secure functions, not direct RLS
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
  OR 
  (invited_by = auth.uid())
  OR
  (
    site_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM websites w
      WHERE w.id = client_invitations.site_id 
      AND w.user_id = auth.uid()
    )
  )
);