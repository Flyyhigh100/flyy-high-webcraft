-- Fix profiles table RLS policy
-- Remove rate limiting from RLS (rate limiting belongs in API layer, not RLS)
-- Keep strict identity-based access control

-- Drop the current problematic policy
DROP POLICY IF EXISTS "Users can view own profile with rate limit, admins can view all" ON public.profiles;

-- Create a proper identity-based SELECT policy without rate limiting
CREATE POLICY "Users can view own profile, admins can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) OR (auth.uid() = id)
);

-- Also ensure the UPDATE policy is properly scoped (it's already correct but let's be explicit)
DROP POLICY IF EXISTS "Users can update own profile, admins can update all" ON public.profiles;

CREATE POLICY "Users can update own profile, admins can update all"
ON public.profiles
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()) OR (auth.uid() = id))
WITH CHECK (is_admin(auth.uid()) OR (auth.uid() = id));