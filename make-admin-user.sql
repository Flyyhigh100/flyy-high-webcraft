-- STEP 1: Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- STEP 2: Clear any existing profile for your user (in case of duplicates)
DELETE FROM profiles 
WHERE email = 'flyyhigh824@gmail.com' 
OR user_id = '594451ef-20ce-4767-8be9-44cc83927a30';

-- STEP 3: Insert your profile with admin role
INSERT INTO profiles (id, user_id, email, role)
VALUES (
  '594451ef-20ce-4767-8be9-44cc83927a30', 
  '594451ef-20ce-4767-8be9-44cc83927a30', 
  'flyyhigh824@gmail.com', 
  'admin'
);

-- STEP 4: Verify your admin status
SELECT * FROM profiles 
WHERE email = 'flyyhigh824@gmail.com';

-- STEP 5: Set up RLS policies (if not already done)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile" 
  ON profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile" 
  ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY IF NOT EXISTS "Admins can view all profiles" 
  ON profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
    )
  ); 