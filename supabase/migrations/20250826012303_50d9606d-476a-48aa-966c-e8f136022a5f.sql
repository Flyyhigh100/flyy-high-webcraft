-- Tighten RLS on client_invitations: restrict SELECT to admins only; move invitee access to edge function
-- Drop overly permissive SELECT policies
DROP POLICY IF EXISTS "Invitees can view invitation with valid token" ON public.client_invitations;
DROP POLICY IF EXISTS "Inviters can view own invitations" ON public.client_invitations;
DROP POLICY IF EXISTS "Website owners can view invitations for their sites" ON public.client_invitations;

-- Keep existing admin SELECT policy as-is (no changes needed)
-- No new public/invitee SELECT policy is created. Token-based access will be provided via a secure Edge Function using the service role.
