-- Performance optimization: Consolidate multiple SELECT policies into single policy
-- Multiple permissive policies for the same action cause suboptimal performance

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view tickets for their websites" ON public.support_tickets;

-- Create single consolidated SELECT policy with OR logic
-- This evaluates once instead of evaluating multiple policies
CREATE POLICY "Users can view own tickets, admins can view all"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (
  -- Admins can see all tickets
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE (profiles.user_id = (select auth.uid()) AND profiles.role = 'admin'::text)
  )
  OR
  -- Users can see tickets for their websites
  EXISTS (
    SELECT 1
    FROM websites
    WHERE (websites.id = support_tickets.site_id AND websites.user_id = (select auth.uid()))
  )
);