-- Harden project_inquiries access: enforce FORCE RLS, scope to proper roles, and revoke anon privileges

-- 1) Ensure RLS is enabled and enforced
ALTER TABLE public.project_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_inquiries FORCE ROW LEVEL SECURITY;

-- 2) Recreate precise policies
DROP POLICY IF EXISTS "Admins can view all project inquiries" ON public.project_inquiries;
DROP POLICY IF EXISTS "Admins can update project inquiries" ON public.project_inquiries;
DROP POLICY IF EXISTS "Service role can insert project inquiries" ON public.project_inquiries;

CREATE POLICY "Admins can view all project inquiries"
  ON public.project_inquiries
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update project inquiries"
  ON public.project_inquiries
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Only the service role may insert inquiries (e.g., via Edge Functions)
CREATE POLICY "Service role can insert project inquiries"
  ON public.project_inquiries
  FOR INSERT
  TO service_role
  WITH CHECK (auth.role() = 'service_role');

-- 3) Defense-in-depth: remove direct anon privileges
REVOKE ALL ON public.project_inquiries FROM anon;