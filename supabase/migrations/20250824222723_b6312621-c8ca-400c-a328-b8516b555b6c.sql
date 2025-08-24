-- Add RLS policy to allow service role to insert payments during reconciliation
CREATE POLICY "Service role can insert payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (true);