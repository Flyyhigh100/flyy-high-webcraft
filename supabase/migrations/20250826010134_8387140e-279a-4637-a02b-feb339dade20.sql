-- Ensure RLS is enabled and add strict invitee access without breaking existing behavior

-- 1) Enable Row Level Security (safe if already enabled)
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

-- 2) Allow invitees (by matching their profile email) to view ONLY their invitations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
      AND tablename = 'client_invitations'
      AND policyname = 'Invitees can view their invitation by email'
  ) THEN
    CREATE POLICY "Invitees can view their invitation by email"
    ON public.client_invitations
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.email IS NOT NULL
          AND lower(p.email) = lower(client_invitations.email)
      )
    );
  END IF;
END$$;