-- Create user_sessions table to track actual login events
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_sign_in TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_sessions
CREATE POLICY "Admins can view all sessions" ON public.user_sessions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Service role can manage sessions" ON public.user_sessions
FOR ALL
USING (true);

-- Create index for better performance
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_sign_in ON public.user_sessions(last_sign_in DESC);

-- Create function to track user sign-ins
CREATE OR REPLACE FUNCTION public.track_user_signin()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the user's last sign-in
  INSERT INTO public.user_sessions (user_id, last_sign_in)
  VALUES (NEW.id, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    last_sign_in = NOW(),
    created_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to track sign-ins when auth.users is updated
CREATE TRIGGER track_signin_trigger
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.track_user_signin();