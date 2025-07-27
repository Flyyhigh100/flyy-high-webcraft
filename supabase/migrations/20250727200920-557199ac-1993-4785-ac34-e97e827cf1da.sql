-- Create a comprehensive client cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_client_data(
  website_id_param UUID DEFAULT NULL,
  client_email_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- Collect all user IDs associated with this website/email
  user_ids := ARRAY[]::UUID[];
  
  -- Add website user_id if exists
  IF website_record.user_id IS NOT NULL THEN
    user_ids := array_append(user_ids, website_record.user_id);
  END IF;

  -- Add user IDs from auth.users matching invitation emails
  IF client_email_param IS NOT NULL THEN
    SELECT array_agg(au.id) INTO user_ids
    FROM auth.users au
    WHERE au.email = client_email_param
    AND au.id = ANY(user_ids) OR NOT (au.id = ANY(user_ids));
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

    -- 7. Delete profiles for associated users
    IF array_length(user_ids, 1) > 0 THEN
      DELETE FROM profiles WHERE id = ANY(user_ids);
    END IF;

    -- 8. Delete auth.users (using admin function simulation)
    -- Note: We can't directly delete from auth.users in a regular function
    -- This would need to be done via the Supabase admin API

    cleanup_result := json_build_object(
      'success', true,
      'message', 'Client data cleaned up successfully',
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

-- Create RLS policy for the cleanup function
CREATE POLICY "Admins can execute cleanup function" 
ON websites FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);