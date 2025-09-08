-- Create project_inquiries table for the simplified client intake system
CREATE TABLE public.project_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contact Info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Project Details
  project_type TEXT NOT NULL,
  current_website TEXT, -- Optional: name or URL of current website
  project_description TEXT NOT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'new', -- new, reviewed, converted, archived
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS
ALTER TABLE public.project_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all project inquiries" 
ON public.project_inquiries 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Service role can insert project inquiries" 
ON public.project_inquiries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update project inquiries" 
ON public.project_inquiries 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Create index for better performance
CREATE INDEX idx_project_inquiries_status ON public.project_inquiries(status);
CREATE INDEX idx_project_inquiries_created_at ON public.project_inquiries(created_at);