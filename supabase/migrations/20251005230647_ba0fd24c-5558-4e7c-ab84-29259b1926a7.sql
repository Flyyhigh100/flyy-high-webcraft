-- Performance optimization: Consolidate multiple SELECT policies into single policy
-- Multiple permissive policies for the same action cause suboptimal performance

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

-- Create single consolidated SELECT policy with OR logic
-- This evaluates once instead of evaluating multiple policies
CREATE POLICY "Users can view own payments, admins can view all"
ON public.payments
FOR SELECT
TO authenticated
USING (
  -- Admins can see all payments
  is_admin((select auth.uid()))
  OR
  -- Users can only see their own payments
  ((select auth.uid()) = user_id)
);