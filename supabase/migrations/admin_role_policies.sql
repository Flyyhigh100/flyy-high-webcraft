
-- Make sure profiles table exists and has the right structure for roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a security definer function to check if a user is an admin
-- This avoids recursive RLS issues
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = _user_id AND role = 'admin'
  );
$$;

-- Make your specific email an admin if it isn't already
INSERT INTO public.profiles (id, user_id, email, role)
VALUES (
  '594451ef-20ce-4767-8be9-44cc83927a30', 
  '594451ef-20ce-4767-8be9-44cc83927a30', 
  'flyyhigh824@gmail.com', 
  'admin'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', email = 'flyyhigh824@gmail.com';

-- Set up proper RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY IF NOT EXISTS "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

-- Admins can update all profiles
CREATE POLICY IF NOT EXISTS "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));
