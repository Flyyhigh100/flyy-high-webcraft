-- Security hardening: prevent role escalation on profiles
-- 1) Create a trigger function to block non-admin role changes
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- If role is being changed, only allow when the acting user is an admin
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Only admins can modify profile roles';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 2) Attach the trigger to the profiles table (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_prevent_role_escalation' 
  ) THEN
    CREATE TRIGGER trg_prevent_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_role_escalation();
  END IF;
END $$;
