-- Performance optimization: Consolidate multiple SELECT policies into single policy
-- Multiple permissive policies for the same action cause suboptimal performance

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Admins can view all websites" ON public.websites;
DROP POLICY IF EXISTS "Users can view own websites" ON public.websites;

-- Create single consolidated SELECT policy with OR logic
-- This evaluates once instead of evaluating multiple policies
CREATE POLICY "Users can view own websites, admins can view all"
ON public.websites
FOR SELECT
TO authenticated
USING (
  -- Admins can see all websites
  is_admin((select auth.uid()))
  OR
  -- Users can only see their own websites
  ((select auth.uid()) = user_id)
);