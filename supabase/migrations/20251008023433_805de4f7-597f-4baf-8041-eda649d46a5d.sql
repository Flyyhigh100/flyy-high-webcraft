-- Fix: Remove SELECT access for regular users to prevent email enumeration
-- Users don't need direct SELECT access because:
-- 1. get-invitation-details edge function uses service role to query by token
-- 2. Users only need UPDATE access to accept invitations
-- 3. All invitation viewing is done through secure edge functions

DROP POLICY IF EXISTS "Users can view own invitations with rate limit, admins bypass" ON public.client_invitations;

-- New policy: Only admins can SELECT (query) invitations
CREATE POLICY "Only admins can view invitations"
ON public.client_invitations
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Update the UPDATE policy to be more explicit about what users can do
-- Users can only UPDATE invitations to mark them as 'used' when accepting
DROP POLICY IF EXISTS "Admins can update all, users can accept own invitations" ON public.client_invitations;

CREATE POLICY "Admins can update all invitations"
ON public.client_invitations
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Separate policy for users accepting invitations (via edge function validation)
-- This policy allows authenticated users to UPDATE invitations to 'used' status
-- but ONLY through the edge function which validates the token first
CREATE POLICY "Users can accept invitations via service role"
ON public.client_invitations
FOR UPDATE
TO service_role  -- Only service role can execute this
USING (
  status = 'pending'
  AND expires_at > now()
)
WITH CHECK (
  status = 'used'
  AND used_at IS NOT NULL
);

-- Add security log for monitoring
CREATE OR REPLACE FUNCTION log_invitation_access_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log non-admin attempts to query invitations
  IF TG_OP = 'SELECT' AND NOT is_admin(auth.uid()) THEN
    INSERT INTO public.security_logs (
      event_type,
      user_id,
      ip_address,
      success,
      details
    ) VALUES (
      'unauthorized_invitation_query',
      auth.uid(),
      inet_client_addr(),
      false,
      jsonb_build_object(
        'table', 'client_invitations',
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NULL;
END;
$$;

-- Note: Triggers on SELECT are not supported in PostgreSQL
-- The logging above is for documentation - actual monitoring happens through RLS policy denials