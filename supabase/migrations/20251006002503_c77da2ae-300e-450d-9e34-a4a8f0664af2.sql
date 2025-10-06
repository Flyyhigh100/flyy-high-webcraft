-- Fix bithomie.com client's invitation status and associate website with user (case-insensitive)
DO $$
DECLARE
  v_user_id uuid := 'dfc1a1b2-dfde-48b3-afd6-b24a9554185f';
  v_website_id uuid := '2a9e50bc-f643-4a00-ad5e-4dee47a7d8fb';
  v_invitation_id uuid := '2fd098dc-0b08-4b86-9d74-4400456f6805';
BEGIN
  -- Update the website to associate it with the user
  UPDATE websites
  SET user_id = v_user_id,
      updated_at = now()
  WHERE id = v_website_id;
  
  -- Mark the invitation as used
  UPDATE client_invitations
  SET status = 'used',
      used_at = now()
  WHERE id = v_invitation_id;
  
  RAISE NOTICE 'Successfully updated bithomie.com website (%) and invitation (%) for user %', v_website_id, v_invitation_id, v_user_id;
END $$;