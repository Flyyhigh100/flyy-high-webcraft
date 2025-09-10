-- Phase 1: Critical Role Protection (fixed)

-- 1) Attach trigger to prevent role escalation (only if not already attached)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'prevent_role_escalation_trigger'
  ) THEN
    CREATE TRIGGER prevent_role_escalation_trigger
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.prevent_role_escalation();
  END IF;
END $$;

-- 2) Ensure role value is constrained to allowed values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint 
    WHERE conname = 'valid_role_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles 
      ADD CONSTRAINT valid_role_check CHECK (role IN ('user','admin'));
  END IF;
END $$;

-- 3) Create logging function for role changes (idempotent)
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
    INSERT INTO public.security_logs (
      event_type,
      user_id,
      details,
      success
    ) VALUES (
      'role_change',
      auth.uid(),
      jsonb_build_object(
        'target_user_id', NEW.id,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'timestamp', NOW()
      ),
      true
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4) Attach/update trigger for role change logging
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'log_role_changes_trigger'
  ) THEN
    DROP TRIGGER log_role_changes_trigger ON public.profiles;
  END IF;
  CREATE TRIGGER log_role_changes_trigger
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_role_changes();
END $$;