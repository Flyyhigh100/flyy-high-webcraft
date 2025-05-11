-- COMPLETE PRODUCTION SETUP FOR SUPABASE
-- This script sets up all necessary tables and security policies for the website

-- ===============================
-- PART 1: PROFILES TABLE SETUP
-- ===============================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Automatically create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email)
  VALUES (NEW.id, NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===============================
-- PART 2: PAYMENTS TABLE SETUP
-- ===============================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'upcoming')),
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  plan TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- PART 3: WEBSITES TABLE SETUP
-- ===============================
CREATE TABLE IF NOT EXISTS websites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  status TEXT DEFAULT 'development' CHECK (status IN ('development', 'published', 'archived')),
  template TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- PART 4: SECURITY POLICIES
-- ===============================

-- Enable Row Level Security for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" 
  ON profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- PAYMENTS POLICIES
-- Allow users to read their own payments
CREATE POLICY "Users can view own payments" 
  ON payments FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow admins to read all payments
CREATE POLICY "Admins can view all payments" 
  ON payments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Allow admins to insert new payments
CREATE POLICY "Admins can insert payments" 
  ON payments FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Allow admins to update payments
CREATE POLICY "Admins can update payments" 
  ON payments FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- WEBSITES POLICIES
-- Allow users to read their own websites
CREATE POLICY "Users can view own websites" 
  ON websites FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to insert their own websites
CREATE POLICY "Users can insert own websites" 
  ON websites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own websites
CREATE POLICY "Users can update own websites" 
  ON websites FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to delete their own websites
CREATE POLICY "Users can delete own websites" 
  ON websites FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow admins to read all websites
CREATE POLICY "Admins can view all websites" 
  ON websites FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Allow admins to update all websites
CREATE POLICY "Admins can update all websites" 
  ON websites FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ===============================
-- PART 5: SETUP YOUR ADMIN ACCOUNT
-- ===============================

-- Find your user in auth.users and update their profile to admin
-- Replace 'flyyhigh824@gmail.com' with your actual email if different
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'flyyhigh824@gmail.com';

-- If you need to insert a specific admin user that doesn't exist yet
-- First create the auth user, then execute:
-- INSERT INTO profiles (id, user_id, email, role)
-- VALUES ('your-user-id', 'your-user-id', 'your-email', 'admin');

-- ===============================
-- PART 6: SAMPLE DATA (Optional)
-- ===============================

-- Uncomment this section if you want to create sample payment data for testing

/*
-- Create sample payments to see in the admin dashboard
INSERT INTO payments (user_id, amount, status, payment_date, plan)
VALUES 
  ((SELECT id FROM auth.users WHERE email = 'flyyhigh824@gmail.com'), 29.99, 'completed', NOW() - INTERVAL '30 days', 'Pro'),
  ((SELECT id FROM auth.users WHERE email = 'flyyhigh824@gmail.com'), 29.99, 'completed', NOW() - INTERVAL '60 days', 'Pro'),
  ((SELECT id FROM auth.users WHERE email = 'flyyhigh824@gmail.com'), 29.99, 'upcoming', NOW() + INTERVAL '15 days', 'Pro');
*/ 