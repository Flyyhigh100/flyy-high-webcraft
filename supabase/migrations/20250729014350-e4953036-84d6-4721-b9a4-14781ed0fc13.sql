-- Add marketing preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN marketing_opt_in BOOLEAN DEFAULT true,
ADD COLUMN marketing_updated_at TIMESTAMPTZ DEFAULT now();

-- Create index for efficient marketing list queries
CREATE INDEX idx_profiles_marketing_opt_in ON public.profiles(marketing_opt_in, email) WHERE marketing_opt_in = true;

-- Update existing users to opt-in by default
UPDATE public.profiles SET marketing_opt_in = true WHERE marketing_opt_in IS NULL;