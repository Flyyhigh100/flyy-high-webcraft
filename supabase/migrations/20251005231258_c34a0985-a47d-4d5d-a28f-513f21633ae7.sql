-- Performance optimization: Replace auth.uid() with (select auth.uid()) in cancellation_feedback RLS policies
-- This prevents unnecessary re-evaluation of auth.uid() for each row

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own cancellation feedback" ON public.cancellation_feedback;

-- Recreate policy with optimized auth.uid() call
CREATE POLICY "Users can insert their own cancellation feedback"
ON public.cancellation_feedback
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id);