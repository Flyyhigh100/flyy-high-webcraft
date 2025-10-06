-- Add explicit anonymous deny policies to sensitive tables containing PII

-- Deny anonymous access to project_inquiries (contains names, emails, phone numbers)
CREATE POLICY "Deny all anonymous access to project inquiries"
ON public.project_inquiries
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to profiles (contains user data)
CREATE POLICY "Deny all anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to payments (contains financial data)
CREATE POLICY "Deny all anonymous access to payments"
ON public.payments
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to subscriptions (contains user financial data)
CREATE POLICY "Deny all anonymous access to subscriptions"
ON public.subscriptions
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to user_sessions (contains user activity data)
CREATE POLICY "Deny all anonymous access to user_sessions"
ON public.user_sessions
FOR ALL
TO anon
USING (false);