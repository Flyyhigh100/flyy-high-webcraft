-- Performance optimization: Replace auth.uid() with (select auth.uid()) in payments RLS policies
-- This prevents unnecessary re-evaluation of auth functions for each row

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Service role can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

-- Recreate policies with optimized auth function calls

-- Admin policy - optimize is_admin call
CREATE POLICY "Admins can view all payments"
ON public.payments
FOR SELECT
TO authenticated
USING (is_admin((select auth.uid())));

-- Service role policy - optimize auth.role() call
CREATE POLICY "Service role can insert payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK ((select auth.role()) = 'service_role'::text);

-- User policy - optimize auth.uid() call
CREATE POLICY "Users can view own payments"
ON public.payments
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);