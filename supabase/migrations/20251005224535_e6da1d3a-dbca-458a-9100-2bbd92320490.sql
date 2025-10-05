-- Performance optimization: Replace auth.uid() with (select auth.uid()) in RLS policies
-- This prevents unnecessary re-evaluation of auth.uid() for each row, improving query performance

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile with rate limit" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate policies with optimized auth.uid() calls

-- Admin policies (using is_admin with optimized auth.uid())
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin((select auth.uid())));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (is_admin((select auth.uid())))
WITH CHECK (is_admin((select auth.uid())));

-- User policies (using optimized auth.uid())
CREATE POLICY "Users can view own profile with rate limit"
ON public.profiles
FOR SELECT
TO authenticated
USING (((select auth.uid()) = id) AND check_profile_query_rate_limit());

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);