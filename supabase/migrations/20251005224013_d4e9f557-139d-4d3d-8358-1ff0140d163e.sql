-- Remove redundant RLS policy and optimize email_templates policies
-- The "Only admins can view email templates" SELECT policy is redundant because
-- the "Admins can manage email templates" ALL policy already covers SELECT operations

-- Drop all existing policies on email_templates table
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Only admins can delete email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Only admins can insert email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Only admins can update email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Only admins can view email templates" ON public.email_templates;

-- Recreate optimized policies with (select auth.uid()) for better performance
-- Using a single ALL policy to cover all operations (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM profiles
  WHERE profiles.id = (select auth.uid())
  AND profiles.role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1
  FROM profiles
  WHERE profiles.id = (select auth.uid())
  AND profiles.role = 'admin'
));

-- Add comment explaining the optimization
COMMENT ON POLICY "Admins can manage email templates" ON public.email_templates IS
'Optimized: Single ALL policy covers SELECT, INSERT, UPDATE, DELETE. Uses (select auth.uid()) to evaluate once per query instead of once per row.';