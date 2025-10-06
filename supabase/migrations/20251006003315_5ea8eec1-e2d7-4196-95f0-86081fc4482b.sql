-- Create recovery codes table for 2FA backup codes
CREATE TABLE IF NOT EXISTS public.recovery_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  used boolean DEFAULT false,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_recovery_codes_user_id ON public.recovery_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_codes_used ON public.recovery_codes(used) WHERE used = false;

-- Enable RLS
ALTER TABLE public.recovery_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own recovery codes
CREATE POLICY "Users can view own recovery codes"
  ON public.recovery_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert recovery codes
CREATE POLICY "Service role can insert recovery codes"
  ON public.recovery_codes
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- Policy: Service role can update recovery codes (mark as used)
CREATE POLICY "Service role can update recovery codes"
  ON public.recovery_codes
  FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.uid() = user_id);

-- Policy: Users can delete their own recovery codes
CREATE POLICY "Users can delete own recovery codes"
  ON public.recovery_codes
  FOR DELETE
  USING (auth.uid() = user_id);