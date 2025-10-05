-- Performance optimization: Consolidate multiple UPDATE policies into single policy
-- Multiple permissive policies for the same action cause suboptimal performance

-- Drop existing UPDATE policies
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create single consolidated UPDATE policy
CREATE POLICY "Users can update own profile, admins can update all"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- Admins can update all profiles
  is_admin((select auth.uid()))
  OR
  -- Users can only update their own profile
  ((select auth.uid()) = id)
)
WITH CHECK (
  -- Admins can update all profiles
  is_admin((select auth.uid()))
  OR
  -- Users can only update their own profile
  ((select auth.uid()) = id)
);