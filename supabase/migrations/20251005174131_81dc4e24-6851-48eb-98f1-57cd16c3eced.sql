-- Drop the admin_profiles_view that exposes auth.users
DROP VIEW IF EXISTS public.admin_profiles_view CASCADE;

-- Add explicit DENY policy for unauthenticated users on client_invitations
CREATE POLICY "Deny unauthenticated access to client_invitations"
ON public.client_invitations
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add explicit DENY policies for non-admin users on user_roles to prevent privilege escalation
CREATE POLICY "Deny non-admin INSERT on user_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Deny non-admin UPDATE on user_roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Deny non-admin DELETE on user_roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);