-- Create client invitations table for onboarding existing clients
CREATE TABLE public.client_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  website_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  site_id UUID REFERENCES public.websites(id) ON DELETE CASCADE,
  invite_token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for client invitations
CREATE POLICY "Admins can view all invitations" 
ON public.client_invitations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can create invitations" 
ON public.client_invitations 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can update invitations" 
ON public.client_invitations 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create subscriptions table to track Stripe subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.websites(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Service role can manage subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (true);

-- Create email templates table for better email management
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables TEXT[], -- Array of variable names used in template
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Policies for email templates
CREATE POLICY "Admins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, html_content, variables) VALUES
('payment_reminder_3_day', 'Payment Due: {{websiteName}} - 3 Day Notice', 
'<h2>Payment Reminder</h2><p>Your payment for {{websiteName}} is due in 3 days. Amount: ${{amount}}</p>', 
ARRAY['websiteName', 'amount', 'dueDate']),

('payment_reminder_overdue', 'OVERDUE: {{websiteName}} - Immediate Action Required', 
'<h2>Payment Overdue</h2><p>Your payment for {{websiteName}} is now overdue. Please pay immediately to avoid service interruption.</p>', 
ARRAY['websiteName', 'amount', 'overdueDays']),

('payment_receipt', 'Payment Received - {{websiteName}}', 
'<h2>Payment Confirmation</h2><p>Thank you! We have received your payment of ${{amount}} for {{websiteName}}.</p>', 
ARRAY['websiteName', 'amount', 'paymentDate']),

('welcome_client', 'Welcome to Our Hosting Platform - {{websiteName}}', 
'<h2>Welcome!</h2><p>Your account has been created successfully. You can now manage {{websiteName}} through our platform.</p>', 
ARRAY['clientName', 'websiteName']);

-- Add updated_at trigger for subscriptions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();