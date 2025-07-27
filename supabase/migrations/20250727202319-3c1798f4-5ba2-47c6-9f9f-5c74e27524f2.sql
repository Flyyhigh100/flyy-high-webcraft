-- Step 1: Recreate the trigger for new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email)
  VALUES (NEW.id, NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 2: Restore admin profiles for existing users
-- Insert admin profile for flyyhigh824@gmail.com
INSERT INTO profiles (id, user_id, email, role)
VALUES (
  '594451ef-20ce-4767-8be9-44cc83927a30',
  '594451ef-20ce-4767-8be9-44cc83927a30', 
  'flyyhigh824@gmail.com',
  'admin'
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  email = 'flyyhigh824@gmail.com';

-- Step 3: Update cleanup function to protect admin profiles
CREATE OR REPLACE FUNCTION public.cleanup_client_data(website_id_param uuid DEFAULT NULL::uuid, client_email_param text DEFAULT NULL::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  website_record RECORD;
  user_ids UUID[];
  cleanup_result JSON;
  deleted_count INTEGER := 0;
BEGIN
  -- Find website record by ID or email
  IF website_id_param IS NOT NULL THEN
    SELECT * INTO website_record FROM websites WHERE id = website_id_param;
  ELSIF client_email_param IS NOT NULL THEN
    -- Find website by matching client invitation email
    SELECT w.* INTO website_record 
    FROM websites w 
    JOIN client_invitations ci ON ci.website_url = w.url OR ci.website_name = w.name
    WHERE ci.email = client_email_param
    LIMIT 1;
  END IF;

  IF website_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Website not found',
      'deleted_count', 0
    );
  END IF;

  -- Collect all user IDs associated with this website/email (EXCLUDING ADMINS)
  user_ids := ARRAY[]::UUID[];
  
  -- Add website user_id if exists and is not an admin
  IF website_record.user_id IS NOT NULL THEN
    -- Check if user is admin before adding to deletion list
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = website_record.user_id AND role = 'admin') THEN
      user_ids := array_append(user_ids, website_record.user_id);
    END IF;
  END IF;

  -- Add user IDs from auth.users matching invitation emails (EXCLUDING ADMINS)
  IF client_email_param IS NOT NULL THEN
    SELECT array_agg(au.id) INTO user_ids
    FROM auth.users au
    LEFT JOIN profiles p ON p.id = au.id
    WHERE au.email = client_email_param
    AND (p.role IS NULL OR p.role != 'admin')
    AND (au.id = ANY(user_ids) OR NOT (au.id = ANY(user_ids)));
  END IF;

  -- Start cleanup process
  BEGIN
    -- 1. Delete payment reminders
    DELETE FROM payment_reminders WHERE site_id = website_record.id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- 2. Delete support tickets
    DELETE FROM support_tickets WHERE site_id = website_record.id;

    -- 3. Delete payments
    DELETE FROM payments WHERE site_id = website_record.id;

    -- 4. Delete subscriptions
    DELETE FROM subscriptions WHERE site_id = website_record.id;

    -- 5. Delete client invitations (by website info or email)
    DELETE FROM client_invitations 
    WHERE (website_url = website_record.url OR website_name = website_record.name)
    OR (client_email_param IS NOT NULL AND email = client_email_param);

    -- 6. Delete the website record
    DELETE FROM websites WHERE id = website_record.id;

    -- 7. Delete profiles for associated NON-ADMIN users only
    IF array_length(user_ids, 1) > 0 THEN
      DELETE FROM profiles 
      WHERE id = ANY(user_ids) 
      AND role != 'admin';
    END IF;

    cleanup_result := json_build_object(
      'success', true,
      'message', 'Client data cleaned up successfully (admin accounts protected)',
      'website_id', website_record.id,
      'website_name', website_record.name,
      'website_url', website_record.url,
      'user_ids_found', user_ids,
      'deleted_count', deleted_count
    );

    RETURN cleanup_result;

  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Error during cleanup: ' || SQLERRM,
      'deleted_count', 0
    );
  END;
END;
$$;