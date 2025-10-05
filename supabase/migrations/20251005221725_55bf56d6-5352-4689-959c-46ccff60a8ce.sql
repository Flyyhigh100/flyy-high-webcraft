-- Add explicit DENY policies for UPDATE and DELETE on security_logs
-- These ensure audit log immutability

-- Deny all UPDATE operations on security logs (including for admins)
CREATE POLICY "Deny all UPDATE operations on security logs"
ON public.security_logs
AS RESTRICTIVE
FOR UPDATE
TO public
USING (false);

-- Deny all DELETE operations on security logs (including for admins)
CREATE POLICY "Deny all DELETE operations on security logs"
ON public.security_logs
AS RESTRICTIVE
FOR DELETE
TO public
USING (false);