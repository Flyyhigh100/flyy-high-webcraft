-- Security Fix: Harden RLS policies to prevent data exposure
-- Phase 1: Critical Data Exposure Fix

-- Force RLS on all sensitive tables to prevent policy bypasses
ALTER TABLE public.client_invitations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.payments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions FORCE ROW LEVEL SECURITY;

-- Drop and recreate overly permissive rate_limits policy
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

-- Create restrictive rate_limits policies (service role and admin only)
CREATE POLICY "Service role can manage rate limits" 
ON public.rate_limits 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view rate limits" 
ON public.rate_limits 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

-- Ensure security_logs is admin-only for SELECT
DROP POLICY IF EXISTS "Admins can view all security logs" ON public.security_logs;
CREATE POLICY "Admins can view all security logs" 
ON public.security_logs 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

-- Harden payments policies - ensure explicit role restrictions
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

CREATE POLICY "Admins can view all payments" 
ON public.payments 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own payments" 
ON public.payments 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Harden client_invitations policies
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.client_invitations;
CREATE POLICY "Admins can view all invitations" 
ON public.client_invitations 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

-- Harden user_sessions policies
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;

CREATE POLICY "Admins can view all sessions" 
ON public.user_sessions 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own sessions" 
ON public.user_sessions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Revoke any default permissions from anon role on sensitive tables
REVOKE ALL ON public.client_invitations FROM anon;
REVOKE ALL ON public.payments FROM anon;
REVOKE ALL ON public.security_logs FROM anon;
REVOKE ALL ON public.rate_limits FROM anon;
REVOKE ALL ON public.user_sessions FROM anon;
REVOKE ALL ON public.subscriptions FROM anon;
REVOKE ALL ON public.profiles FROM anon;

-- Ensure only authenticated users can access these tables
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.payments TO authenticated;
GRANT SELECT ON public.user_sessions TO authenticated;
GRANT SELECT ON public.client_invitations TO authenticated;
GRANT SELECT ON public.security_logs TO authenticated;
GRANT SELECT ON public.rate_limits TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;