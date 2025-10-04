-- COMPREHENSIVE SECURITY FIX
-- Part 1: Create proper role system to prevent privilege escalation

-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table with proper foreign key to auth.users
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role 
FROM public.profiles 
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update is_admin function to use new user_roles table
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin');
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Part 2: Add secure RLS policies for client_invitations (defense in depth)

-- Allow authenticated users to view their own invitations
CREATE POLICY "Users can view own invitations via token"
ON public.client_invitations
FOR SELECT
TO authenticated
USING (
  LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  AND status IN ('pending', 'used')
  AND expires_at > now()
);

-- Allow authenticated users to accept their own invitations
CREATE POLICY "Users can accept own invitations"
ON public.client_invitations
FOR UPDATE
TO authenticated
USING (
  LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  AND status = 'pending'
  AND expires_at > now()
)
WITH CHECK (
  status = 'used'
  AND used_at IS NOT NULL
  AND LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Part 3: Update trigger to use new user_roles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, user_id, email, role)
  VALUES (NEW.id, NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = CURRENT_TIMESTAMP;
  
  -- Insert default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Part 4: Update role change prevention trigger
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- If role is being changed in profiles table, only allow when the acting user is an admin
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Only admins can modify profile roles. Use user_roles table instead.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Note: The 'role' column in profiles table is kept for backward compatibility
-- but should be considered deprecated. All role checks should use user_roles table
-- via the has_role() or is_admin() functions.