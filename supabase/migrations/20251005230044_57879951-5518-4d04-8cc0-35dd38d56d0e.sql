-- Performance optimization: Consolidate multiple UPDATE policies into single policy
-- Multiple permissive policies for the same action cause suboptimal performance

-- Drop existing UPDATE policies
DROP POLICY IF EXISTS "Admins can execute cleanup function" ON public.websites;
DROP POLICY IF EXISTS "Admins can update websites" ON public.websites;

-- Create single consolidated UPDATE policy
-- This evaluates once instead of evaluating multiple policies
CREATE POLICY "Admins can update and manage websites"
ON public.websites
FOR UPDATE
TO authenticated
USING (is_admin((select auth.uid())))
WITH CHECK (is_admin((select auth.uid())));