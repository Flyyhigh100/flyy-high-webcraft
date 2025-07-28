-- Add DELETE permission for admins on client_invitations table
CREATE POLICY "Admins can delete invitations" 
ON public.client_invitations
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));