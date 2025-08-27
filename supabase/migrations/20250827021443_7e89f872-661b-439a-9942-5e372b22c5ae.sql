-- Create a secure function to fetch minimal invitation info for the current user
CREATE OR REPLACE FUNCTION public.get_user_invitation_status()
RETURNS TABLE (
  has_active_invitation boolean,
  invitation_plan text,
  invitation_amount numeric,
  invitation_id uuid,
  site_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get current user's email from profiles
  SELECT email INTO user_email FROM public.profiles WHERE id = auth.uid();

  IF user_email IS NULL THEN
    -- No profile/email for user; return a single row indicating no invitation
    RETURN QUERY SELECT FALSE, NULL::text, NULL::numeric, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;

  -- Return latest used invitation for this email, if any
  RETURN QUERY
  SELECT TRUE,
         ci.plan_type,
         ci.next_payment_amount,
         ci.id,
         ci.site_id
  FROM public.client_invitations ci
  WHERE ci.email = user_email
    AND ci.status = 'used'
  ORDER BY ci.created_at DESC
  LIMIT 1;

  -- If no rows were returned above, return a single false row
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::text, NULL::numeric, NULL::uuid, NULL::uuid;
  END IF;
END;
$$;