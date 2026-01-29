-- Create website_project_intake table for multi-step intake form
CREATE TABLE public.website_project_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,

  -- Section 1: Contact Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_contact_method TEXT NOT NULL,

  -- Section 2: About Your Business
  business_name TEXT NOT NULL,
  business_description TEXT NOT NULL,
  industry TEXT NOT NULL,
  has_existing_website BOOLEAN NOT NULL DEFAULT false,
  current_website_url TEXT,

  -- Section 3: Branding & Design Assets
  has_logo TEXT NOT NULL,
  has_color_palette TEXT NOT NULL,
  brand_colors TEXT,
  has_brand_guidelines TEXT NOT NULL,
  has_professional_photos TEXT NOT NULL,

  -- Section 4: Domain & Hosting
  owns_domain TEXT NOT NULL,
  domain_name TEXT,
  has_domain_registrar_access TEXT NOT NULL,
  has_hosting TEXT NOT NULL,
  needs_ongoing_hosting TEXT NOT NULL,

  -- Section 5: Website Requirements
  website_types TEXT[] NOT NULL,
  is_new_or_redesign TEXT NOT NULL,
  estimated_pages TEXT NOT NULL,
  required_features TEXT[] NOT NULL,
  has_content_ready TEXT NOT NULL,
  needs_content_updates TEXT NOT NULL,

  -- Section 6: Design Preferences
  design_styles TEXT[] NOT NULL,
  reference_websites TEXT,
  design_dislikes TEXT,

  -- Section 7: Budget & Timeline
  budget_range TEXT NOT NULL,
  timeline TEXT NOT NULL,
  deadline_event TEXT,

  -- Section 8: Additional Information
  competitors TEXT,
  target_audience TEXT NOT NULL,
  website_goals TEXT[] NOT NULL,
  referral_source TEXT,
  additional_notes TEXT
);

-- Enable RLS
ALTER TABLE public.website_project_intake ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert (for edge function submissions)
CREATE POLICY "Service role can insert intake submissions"
ON public.website_project_intake
FOR INSERT
WITH CHECK ((SELECT auth.role()) = 'service_role');

-- Policy: Admins can view all submissions
CREATE POLICY "Admins can view all intake submissions"
ON public.website_project_intake
FOR SELECT
USING (is_admin(auth.uid()));

-- Policy: Admins can update submissions
CREATE POLICY "Admins can update intake submissions"
ON public.website_project_intake
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Policy: Admins can delete submissions
CREATE POLICY "Admins can delete intake submissions"
ON public.website_project_intake
FOR DELETE
USING (is_admin(auth.uid()));

-- Policy: Block anonymous access
CREATE POLICY "Block anonymous access to intake submissions"
ON public.website_project_intake
FOR ALL
USING (false);

-- Create validation trigger for email format
CREATE OR REPLACE FUNCTION public.validate_website_intake()
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
  IF LENGTH(NEW.full_name) > 120 THEN
    RAISE EXCEPTION 'Full name exceeds maximum length of 120 characters';
  END IF;
  
  IF LENGTH(NEW.email) > 254 THEN
    RAISE EXCEPTION 'Email exceeds maximum length of 254 characters';
  END IF;
  
  IF LENGTH(NEW.business_name) > 200 THEN
    RAISE EXCEPTION 'Business name exceeds maximum length of 200 characters';
  END IF;
  
  -- Normalize email to lowercase
  NEW.email = LOWER(TRIM(NEW.email));
  
  -- Log the submission
  INSERT INTO public.security_logs (
    event_type,
    success,
    details
  ) VALUES (
    'website_intake_submission',
    true,
    jsonb_build_object(
      'email', NEW.email,
      'business_name', NEW.business_name,
      'timestamp', now()
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER validate_website_intake_trigger
BEFORE INSERT ON public.website_project_intake
FOR EACH ROW
EXECUTE FUNCTION public.validate_website_intake();