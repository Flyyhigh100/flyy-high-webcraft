-- Performance optimization: Replace auth.uid() with (select auth.uid()) in project_inquiries RLS policies
-- This prevents unnecessary re-evaluation of auth.uid() for each row

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can update project inquiries" ON public.project_inquiries;
DROP POLICY IF EXISTS "Admins can view all project inquiries" ON public.project_inquiries;
DROP POLICY IF EXISTS "Service role can insert project inquiries" ON public.project_inquiries;

-- Recreate policies with optimized auth function calls

CREATE POLICY "Admins can update project inquiries"
ON public.project_inquiries
FOR UPDATE
TO authenticated
USING (is_admin((select auth.uid())))
WITH CHECK (is_admin((select auth.uid())));

CREATE POLICY "Admins can view all project inquiries"
ON public.project_inquiries
FOR SELECT
TO authenticated
USING (is_admin((select auth.uid())));

CREATE POLICY "Service role can insert project inquiries"
ON public.project_inquiries
FOR INSERT
TO authenticated
WITH CHECK ((select auth.role()) = 'service_role'::text);