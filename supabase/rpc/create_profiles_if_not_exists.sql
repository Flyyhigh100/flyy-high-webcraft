CREATE OR REPLACE FUNCTION create_profiles_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if profiles table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    -- Create profiles table
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT,
      role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Enable RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view own profile" 
      ON profiles FOR SELECT 
      USING (auth.uid() = id);

    CREATE POLICY "Users can update own profile" 
      ON profiles FOR UPDATE 
      USING (auth.uid() = id);

    CREATE POLICY "Admins can view all profiles" 
      ON profiles FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
        )
      );

    CREATE POLICY "Admins can update all profiles" 
      ON profiles FOR UPDATE 
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
        )
      );
  END IF;
END;
$$; 