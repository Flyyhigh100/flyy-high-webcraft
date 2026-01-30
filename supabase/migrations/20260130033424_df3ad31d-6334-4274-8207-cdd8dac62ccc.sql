-- Remove redundant user_id column from profiles table
-- The 'id' column already serves as the primary key mapped to auth.users.id
-- Having both creates unnecessary attack surface for user ID enumeration

-- Step 1: Update the handle_new_user function to not use user_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile without the redundant user_id column
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO UPDATE SET
    updated_at = CURRENT_TIMESTAMP;
  
  -- Insert default user role in user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Step 2: Drop the redundant user_id column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_id;

-- Add a comment explaining the security model
COMMENT ON TABLE public.profiles IS 'User profiles - id maps directly to auth.users.id. No redundant ID columns to prevent enumeration attacks.';