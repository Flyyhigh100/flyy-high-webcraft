-- Performance optimization: Replace auth.uid() with (select auth.uid()) in support_tickets RLS policies
-- This prevents unnecessary re-evaluation of auth.uid() for each row

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can update all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create tickets for their websites" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view tickets for their websites" ON public.support_tickets;

-- Recreate policies with optimized auth.uid() calls

-- Admin policies
CREATE POLICY "Admins can update all tickets"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE (profiles.user_id = (select auth.uid()) AND profiles.role = 'admin'::text)
  )
);

CREATE POLICY "Admins can view all tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE (profiles.user_id = (select auth.uid()) AND profiles.role = 'admin'::text)
  )
);

-- User policies
CREATE POLICY "Users can create tickets for their websites"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM websites
    WHERE (websites.id = support_tickets.site_id AND websites.user_id = (select auth.uid()))
  )
);

CREATE POLICY "Users can view tickets for their websites"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM websites
    WHERE (websites.id = support_tickets.site_id AND websites.user_id = (select auth.uid()))
  )
);