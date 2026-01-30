-- ============================================================
-- COMPREHENSIVE RLS HARDENING MIGRATION
-- Goal: Explicit deny-by-default + clear allow policies
-- Tables: project_inquiries, website_project_intake, subscriptions
-- ============================================================

-- ============================================================
-- STEP 1: Fix project_inquiries policies
-- ============================================================

-- 1.1 Drop existing problematic policies
DROP POLICY IF EXISTS "Only admins can view project inquiries" ON public.project_inquiries;
DROP POLICY IF EXISTS "Service role can insert project inquiries" ON public.project_inquiries;
DROP POLICY IF EXISTS "Deny all anonymous access to project inquiries" ON public.project_inquiries;

-- 1.2 Create explicit anon deny policy (FOR ALL operations)
CREATE POLICY "Deny anon access to project_inquiries"
ON public.project_inquiries
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- 1.3 Create PERMISSIVE admin-only SELECT policy for authenticated users
CREATE POLICY "Admins can view project inquiries"
ON public.project_inquiries
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- 1.4 Correctly scope service_role INSERT policy
CREATE POLICY "Service role inserts project inquiries"
ON public.project_inquiries
AS PERMISSIVE
FOR INSERT
TO service_role
WITH CHECK (true);

-- 1.5 Keep the admin UPDATE policy (already exists and is correct)
-- "Admins can update project inquiries" - no changes needed

-- ============================================================
-- STEP 2: Verify subscriptions (already good, no changes needed)
-- The existing policies are correctly scoped:
-- - "Deny all anonymous access to subscriptions" TO anon
-- - "Users can view own subscriptions, admins can view all" TO authenticated
-- ============================================================

-- ============================================================
-- STEP 3: Fix website_project_intake policies
-- ============================================================

-- 3.1 Force RLS (critical for table owner bypass prevention)
ALTER TABLE public.website_project_intake FORCE ROW LEVEL SECURITY;

-- 3.2 Drop existing problematic policies scoped to 'public'
DROP POLICY IF EXISTS "Block anonymous access to intake submissions" ON public.website_project_intake;
DROP POLICY IF EXISTS "Admins can view all intake submissions" ON public.website_project_intake;
DROP POLICY IF EXISTS "Admins can update intake submissions" ON public.website_project_intake;
DROP POLICY IF EXISTS "Admins can delete intake submissions" ON public.website_project_intake;
DROP POLICY IF EXISTS "Service role can insert intake submissions" ON public.website_project_intake;

-- 3.3 Create explicit anon deny policy
CREATE POLICY "Deny anon access to website_project_intake"
ON public.website_project_intake
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- 3.4 Create PERMISSIVE admin-only policies for authenticated users
CREATE POLICY "Admins can view intake submissions"
ON public.website_project_intake
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update intake submissions"
ON public.website_project_intake
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete intake submissions"
ON public.website_project_intake
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- 3.5 Correctly scope service_role INSERT policy
CREATE POLICY "Service role inserts intake submissions"
ON public.website_project_intake
AS PERMISSIVE
FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================================
-- STEP 4: Log this security hardening event
-- ============================================================
INSERT INTO public.security_logs (event_type, success, details)
VALUES (
  'rls_policy_hardening',
  true,
  jsonb_build_object(
    'tables_updated', ARRAY['project_inquiries', 'website_project_intake'],
    'changes', 'Explicit role scoping, forced RLS, removed TO public policies',
    'timestamp', now()
  )
);