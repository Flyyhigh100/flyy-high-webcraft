-- Performance optimization: Prevent auth.uid() re-evaluation in admin policies
-- Replace is_admin(auth.uid()) with is_admin((select auth.uid())) for better performance at scale

-- Drop existing admin policies on websites table
DROP POLICY IF EXISTS "Admins can insert websites" ON public.websites;
DROP POLICY IF EXISTS "Admins can update websites" ON public.websites;
DROP POLICY IF EXISTS "Admins can view all websites" ON public.websites;
DROP POLICY IF EXISTS "Admins can delete websites" ON public.websites;
DROP POLICY IF EXISTS "Admins can execute cleanup function" ON public.websites;

-- Recreate with optimized auth.uid() calls

CREATE POLICY "Admins can insert websites"
ON public.websites
FOR INSERT
TO authenticated
WITH CHECK (is_admin((select auth.uid())));

CREATE POLICY "Admins can update websites"
ON public.websites
FOR UPDATE
TO authenticated
USING (is_admin((select auth.uid())));

CREATE POLICY "Admins can view all websites"
ON public.websites
FOR SELECT
TO authenticated
USING (is_admin((select auth.uid())));

CREATE POLICY "Admins can delete websites"
ON public.websites
FOR DELETE
TO authenticated
USING (is_admin((select auth.uid())));

CREATE POLICY "Admins can execute cleanup function"
ON public.websites
FOR ALL
TO authenticated
USING (is_admin((select auth.uid())));

-- Add comments explaining the optimization
COMMENT ON POLICY "Admins can insert websites" ON public.websites IS
'Optimized: Uses (select auth.uid()) to evaluate the user ID once per query instead of once per row.';

COMMENT ON POLICY "Admins can update websites" ON public.websites IS
'Optimized: Uses (select auth.uid()) to evaluate the user ID once per query instead of once per row.';

COMMENT ON POLICY "Admins can view all websites" ON public.websites IS
'Optimized: Uses (select auth.uid()) to evaluate the user ID once per query instead of once per row.';

COMMENT ON POLICY "Admins can delete websites" ON public.websites IS
'Optimized: Uses (select auth.uid()) to evaluate the user ID once per query instead of once per row.';

COMMENT ON POLICY "Admins can execute cleanup function" ON public.websites IS
'Optimized: Uses (select auth.uid()) to evaluate the user ID once per query instead of once per row.';