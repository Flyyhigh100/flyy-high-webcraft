-- RLS: allow authenticated users to read their own invitations by email
CREATE POLICY IF NOT EXISTS "Users can view own invitations by email"
ON public.client_invitations
FOR SELECT
TO authenticated
USING (
  email = (current_setting('request.jwt.claims', true)::jsonb ->> 'email')
);
