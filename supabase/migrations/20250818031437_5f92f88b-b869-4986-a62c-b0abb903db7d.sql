-- Create cancellation_feedback table to store user cancellation feedback
CREATE TABLE public.cancellation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id TEXT NOT NULL,
  cancellation_reason TEXT,
  comment TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cancellation_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for cancellation feedback
CREATE POLICY "Users can view their own cancellation feedback" 
ON public.cancellation_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cancellation feedback" 
ON public.cancellation_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all cancellation feedback" 
ON public.cancellation_feedback 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));