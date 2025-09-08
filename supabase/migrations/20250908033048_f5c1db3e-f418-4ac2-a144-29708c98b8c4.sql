
-- 1) Enforce RLS and FORCE RLS on payments (defense-in-depth)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments FORCE ROW LEVEL SECURITY;

-- 2) Standardize/tighten payments policies
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Service role can insert payments" ON public.payments;

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON public.payments
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only the service role may insert payments (e.g., via Edge Functions / webhooks)
CREATE POLICY "Service role can insert payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- 3) Defense-in-depth: ensure RLS is enforced on sensitive tables (safe if already enabled)
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invitations FORCE ROW LEVEL SECURITY;

ALTER TABLE public.project_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_inquiries FORCE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- 4) Activate role-escalation protection on profiles
-- Drop and re-create trigger to ensure it's present and current
DROP TRIGGER IF EXISTS t_prevent_role_escalation ON public.profiles;

CREATE TRIGGER t_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();
