-- Create a security definer function to check if user's email is verified
CREATE OR REPLACE FUNCTION public.is_user_email_verified()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_verified boolean;
BEGIN
  -- Check if the current user's email is confirmed in auth.users
  SELECT (email_confirmed_at IS NOT NULL) INTO user_verified
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Return false if no user found or email not verified
  RETURN COALESCE(user_verified, false);
END;
$$;

-- Update the client_invitations SELECT policy to require verified email
DROP POLICY IF EXISTS "Users can view own invitations by email with rate limit" ON public.client_invitations;

CREATE POLICY "Users can view own invitations with verified email"
ON public.client_invitations
FOR SELECT
TO authenticated
USING (
  -- User must have verified their email
  is_user_email_verified()
  -- Rate limiting protection
  AND check_invitation_query_rate_limit()
  -- Email must match the authenticated user's verified email
  AND lower(email) = lower((
    SELECT email::text 
    FROM auth.users 
    WHERE id = auth.uid()
      AND email_confirmed_at IS NOT NULL
  ))
);

-- Add a helper function for edge functions to validate invitation access
CREATE OR REPLACE FUNCTION public.can_user_access_invitation(invitation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_email text;
  user_email text;
  user_verified boolean;
BEGIN
  -- Get the invitation email
  SELECT email INTO invitation_email
  FROM client_invitations
  WHERE id = invitation_id;
  
  -- Get the user's email and verification status
  SELECT email::text, (email_confirmed_at IS NOT NULL)
  INTO user_email, user_verified
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Return true only if email matches and is verified
  RETURN (
    invitation_email IS NOT NULL 
    AND user_email IS NOT NULL 
    AND user_verified = true
    AND lower(invitation_email) = lower(user_email)
  );
END;
$$;