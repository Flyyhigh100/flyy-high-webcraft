-- Update bithomie.com client's invitation status and associate website with user
-- First find the user ID for the email Chris.d.Conley+stan@gmail.com
DO $$
DECLARE
  v_user_id uuid;
  v_website_id uuid := '2a9e50bc-f643-4a00-ad5e-4dee47a7d8fb';
  v_invitation_id uuid := '2fd098dc-0b08-4b86-9d74-4400456f6805';
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'Chris.d.Conley+stan@gmail.com';
  
  -- Update the website to associate it with the user
  IF v_user_id IS NOT NULL THEN
    UPDATE websites
    SET user_id = v_user_id,
        updated_at = now()
    WHERE id = v_website_id;
    
    -- Mark the invitation as used
    UPDATE client_invitations
    SET status = 'used',
        used_at = now()
    WHERE id = v_invitation_id;
    
    RAISE NOTICE 'Successfully updated bithomie.com website and invitation for user %', v_user_id;
  ELSE
    RAISE NOTICE 'User not found for email Chris.d.Conley+stan@gmail.com';
  END IF;
END $$;