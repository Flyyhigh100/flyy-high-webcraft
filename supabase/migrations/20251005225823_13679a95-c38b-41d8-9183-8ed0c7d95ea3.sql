-- Performance optimization: Consolidate multiple SELECT policies into single policy
-- Multiple permissive policies for the same action cause suboptimal performance

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Admins can view all cancellation feedback" ON public.cancellation_feedback;
DROP POLICY IF EXISTS "Users can view their own cancellation feedback" ON public.cancellation_feedback;

-- Create single consolidated SELECT policy with OR logic
-- This evaluates once instead of evaluating multiple policies
CREATE POLICY "Users can view own feedback, admins can view all"
ON public.cancellation_feedback
FOR SELECT
TO authenticated
USING (
  -- Users can see their own feedback OR user is admin
  ((select auth.uid()) = user_id)
  OR
  is_admin((select auth.uid()))
);