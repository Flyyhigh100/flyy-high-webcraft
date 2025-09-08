-- Create rate limiting table for IP-based rate limiting
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_rate_limits_ip_endpoint ON public.rate_limits(ip_address, endpoint);
CREATE INDEX idx_rate_limits_window_start ON public.rate_limits(window_start);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to manage rate limits
CREATE POLICY "Service role can manage rate limits" 
  ON public.rate_limits 
  FOR ALL 
  USING (true);

-- Create security audit log table
CREATE TABLE public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at);

-- Enable RLS
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for security logs
CREATE POLICY "Admins can view all security logs" 
  ON public.security_logs 
  FOR SELECT 
  USING (is_admin(auth.uid()));

CREATE POLICY "Service role can insert security logs" 
  ON public.security_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create function to clean up old rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete rate limit entries older than 1 hour
  DELETE FROM public.rate_limits 
  WHERE window_start < (now() - interval '1 hour');
END;
$$;