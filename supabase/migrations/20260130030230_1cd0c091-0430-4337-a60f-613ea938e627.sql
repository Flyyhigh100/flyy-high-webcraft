-- Fix overly permissive RLS policy on security_logs table
-- Current policy allows any user to insert, should be service_role only

DROP POLICY IF EXISTS "Service role can insert security logs" ON public.security_logs;

CREATE POLICY "Service role can insert security logs"
ON public.security_logs
FOR INSERT
TO authenticated, anon
WITH CHECK (auth.role() = 'service_role');