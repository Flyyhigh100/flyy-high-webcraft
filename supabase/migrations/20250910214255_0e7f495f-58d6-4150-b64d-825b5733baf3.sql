-- Phase 1: Critical Role Protection
-- Activate the role escalation protection trigger
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- Add constraint to ensure role field can only be 'user' or 'admin'
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_role_check CHECK (role IN ('user', 'admin'));

-- Update the "Users can update own profile" policy to exclude role field
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    -- Prevent users from changing their own role
    (NEW.role IS NOT DISTINCT FROM OLD.role OR public.is_admin(auth.uid()))
  );

-- Add additional security logging for role changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any role changes to security_logs
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

-- Create trigger for role change logging
CREATE TRIGGER log_role_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_changes();