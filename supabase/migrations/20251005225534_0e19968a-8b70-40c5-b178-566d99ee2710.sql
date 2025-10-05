-- Performance optimization: Replace auth.uid() with (select auth.uid()) in payment_reminders RLS policies
-- This prevents unnecessary re-evaluation of auth.uid() for each row

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can create payment reminders" ON public.payment_reminders;
DROP POLICY IF EXISTS "Admins can view all payment reminders" ON public.payment_reminders;

-- Recreate policies with optimized auth.uid() calls

CREATE POLICY "Admins can create payment reminders"
ON public.payment_reminders
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE (profiles.user_id = (select auth.uid()) AND profiles.role = 'admin'::text)
  )
);

CREATE POLICY "Admins can view all payment reminders"
ON public.payment_reminders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE (profiles.user_id = (select auth.uid()) AND profiles.role = 'admin'::text)
  )
);