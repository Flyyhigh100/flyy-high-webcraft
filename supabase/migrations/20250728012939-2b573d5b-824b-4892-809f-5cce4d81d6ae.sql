-- Add versioning and tracking columns to client_invitations table
ALTER TABLE public.client_invitations 
ADD COLUMN IF NOT EXISTS superseded_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS superseded_by uuid,
ADD COLUMN IF NOT EXISTS invitation_version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS created_by_name text;

-- Create an index for faster lookups by email and status
CREATE INDEX IF NOT EXISTS idx_client_invitations_email_status 
ON public.client_invitations(email, status);

-- Create an index for superseded tracking
CREATE INDEX IF NOT EXISTS idx_client_invitations_superseded 
ON public.client_invitations(superseded_at) WHERE superseded_at IS NOT NULL;