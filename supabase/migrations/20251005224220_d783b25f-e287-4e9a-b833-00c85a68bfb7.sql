-- Security fix: Ensure email_templates is NOT publicly readable
-- Only authenticated admin users should have access to email templates

-- First, ensure RLS is enabled on the table
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;

-- Create a strict admin-only policy for all operations
-- This explicitly requires authentication AND admin role
CREATE POLICY "Admin only access to email templates"
ON public.email_templates
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- Explicitly deny access to anon role
CREATE POLICY "Deny all anon access to email templates"
ON public.email_templates
FOR ALL
TO anon
USING (false);

-- Add security comment
COMMENT ON TABLE public.email_templates IS
'SECURITY: Contains sensitive business email templates. Access restricted to authenticated admin users only. Public/anonymous access explicitly denied.';

COMMENT ON POLICY "Admin only access to email templates" ON public.email_templates IS
'Security policy: Only authenticated users with admin role can access email templates. Prevents competitors from copying business messaging strategy.';