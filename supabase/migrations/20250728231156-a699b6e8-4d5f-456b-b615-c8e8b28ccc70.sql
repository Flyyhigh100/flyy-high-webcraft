-- Add policy to allow unauthenticated users to verify invitations by token
CREATE POLICY "Anyone can verify invitations by token" 
  ON client_invitations 
  FOR SELECT 
  TO anon
  USING (invite_token IS NOT NULL);