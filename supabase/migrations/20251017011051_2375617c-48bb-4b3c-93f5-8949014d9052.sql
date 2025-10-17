-- Add database-level validation for project_inquiries table
-- This provides defense-in-depth validation beyond edge function checks

-- Create validation trigger function
CREATE OR REPLACE FUNCTION public.validate_project_inquiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate email format
  IF NEW.email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.email;
  END IF;
  
  -- Validate field lengths
  IF LENGTH(NEW.name) > 120 THEN
    RAISE EXCEPTION 'Name exceeds maximum length of 120 characters';
  END IF;
  
  IF LENGTH(NEW.email) > 254 THEN
    RAISE EXCEPTION 'Email exceeds maximum length of 254 characters';
  END IF;
  
  IF NEW.phone IS NOT NULL AND LENGTH(NEW.phone) > 40 THEN
    RAISE EXCEPTION 'Phone exceeds maximum length of 40 characters';
  END IF;
  
  IF LENGTH(NEW.project_type) > 80 THEN
    RAISE EXCEPTION 'Project type exceeds maximum length of 80 characters';
  END IF;
  
  IF NEW.current_website IS NOT NULL AND LENGTH(NEW.current_website) > 200 THEN
    RAISE EXCEPTION 'Current website URL exceeds maximum length of 200 characters';
  END IF;
  
  IF LENGTH(NEW.project_description) > 2000 THEN
    RAISE EXCEPTION 'Project description exceeds maximum length of 2000 characters';
  END IF;
  
  -- Validate required fields are not empty
  IF TRIM(NEW.name) = '' THEN
    RAISE EXCEPTION 'Name cannot be empty';
  END IF;
  
  IF TRIM(NEW.email) = '' THEN
    RAISE EXCEPTION 'Email cannot be empty';
  END IF;
  
  IF TRIM(NEW.project_type) = '' THEN
    RAISE EXCEPTION 'Project type cannot be empty';
  END IF;
  
  IF TRIM(NEW.project_description) = '' THEN
    RAISE EXCEPTION 'Project description cannot be empty';
  END IF;
  
  -- Normalize email to lowercase
  NEW.email = LOWER(TRIM(NEW.email));
  
  -- Log the validation in security_logs
  INSERT INTO public.security_logs (
    event_type,
    success,
    details
  ) VALUES (
    'project_inquiry_database_validation',
    true,
    jsonb_build_object(
      'email', NEW.email,
      'project_type', NEW.project_type,
      'timestamp', now()
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for INSERT operations
DROP TRIGGER IF EXISTS validate_project_inquiry_trigger ON public.project_inquiries;
CREATE TRIGGER validate_project_inquiry_trigger
  BEFORE INSERT ON public.project_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_project_inquiry();

-- Add comment for documentation
COMMENT ON FUNCTION public.validate_project_inquiry() IS 'Validates project inquiry data at database level for defense-in-depth security';

-- Log the migration
INSERT INTO public.security_logs (
  event_type,
  success,
  details
) VALUES (
  'database_validation_trigger_created',
  true,
  jsonb_build_object(
    'action', 'created_project_inquiry_validation_trigger',
    'timestamp', now(),
    'description', 'Added database-level validation for project_inquiries table to complement edge function validation'
  )
);