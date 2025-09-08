
-- Harden project_inquiries insert policy and add input validations and indexes

-- 1) Ensure RLS is enforced (safe if already enabled)
ALTER TABLE public.project_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_inquiries FORCE ROW LEVEL SECURITY;

-- 2) Restrict inserts to service role only (replace permissive policy)
DROP POLICY IF EXISTS "Service role can insert project inquiries" ON public.project_inquiries;

CREATE POLICY "Service role can insert project inquiries"
  ON public.project_inquiries
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- 3) Add basic, immutable input validations (NOT VALID to avoid legacy-row failures)
ALTER TABLE public.project_inquiries
  ADD CONSTRAINT project_inquiries_email_format_chk
    CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$') NOT VALID,
  ADD CONSTRAINT project_inquiries_name_length_chk
    CHECK (char_length(name) BETWEEN 1 AND 200) NOT VALID,
  ADD CONSTRAINT project_inquiries_project_type_length_chk
    CHECK (char_length(project_type) BETWEEN 1 AND 100) NOT VALID,
  ADD CONSTRAINT project_inquiries_description_length_chk
    CHECK (char_length(project_description) BETWEEN 1 AND 5000) NOT VALID,
  ADD CONSTRAINT project_inquiries_phone_sane_chk
    CHECK (
      phone IS NULL
      OR char_length(regexp_replace(phone, '[^0-9+]', '', 'g')) BETWEEN 7 AND 20
    ) NOT VALID;

-- 4) Helpful indexes for admin queries and rate-limiting lookups
CREATE INDEX IF NOT EXISTS project_inquiries_email_idx ON public.project_inquiries (email);
CREATE INDEX IF NOT EXISTS project_inquiries_created_at_idx ON public.project_inquiries (created_at DESC);
