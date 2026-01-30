-- First, drop the existing admin SELECT policy to recreate it with explicit role targeting
DROP POLICY IF EXISTS "Admins can view all project inquiries" ON public.project_inquiries;

-- Create a more explicit restrictive policy that ensures only admins can view
-- This policy explicitly targets authenticated users and requires admin role
CREATE POLICY "Only admins can view project inquiries"
ON public.project_inquiries
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Add a comment explaining the security model
COMMENT ON TABLE public.project_inquiries IS 'Customer project inquiries - contains sensitive PII. Access restricted to admins only via RLS.';