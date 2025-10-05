-- Performance optimization: Prevent auth.uid() re-evaluation for each row
-- Replace auth.uid() with (select auth.uid()) in user-based RLS policies

-- Drop the existing "Users can view own websites" policy
DROP POLICY IF EXISTS "Users can view own websites" ON public.websites;

-- Recreate with optimized auth.uid() call
CREATE POLICY "Users can view own websites"
ON public.websites
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

-- Add comment explaining the optimization
COMMENT ON POLICY "Users can view own websites" ON public.websites IS
'Optimized: Uses (select auth.uid()) to evaluate the user ID once per query instead of once per row, improving performance at scale.';