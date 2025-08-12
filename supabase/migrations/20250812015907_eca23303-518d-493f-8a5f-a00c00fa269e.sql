-- Backfill profiles for any user_ids referenced by payments and websites to ensure FK integrity
-- Note: email stays NULL if unknown; role defaults to 'user'

-- From payments
INSERT INTO public.profiles (id, user_id, role)
SELECT p.user_id, p.user_id, 'user'
FROM public.payments p
LEFT JOIN public.profiles pr ON pr.id = p.user_id
WHERE pr.id IS NULL
GROUP BY p.user_id;

-- From websites
INSERT INTO public.profiles (id, user_id, role)
SELECT w.user_id, w.user_id, 'user'
FROM public.websites w
LEFT JOIN public.profiles pr ON pr.id = w.user_id
WHERE w.user_id IS NOT NULL AND pr.id IS NULL
GROUP BY w.user_id;

-- Create helpful indexes on referencing columns (if they don't already exist)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'idx_payments_user_id'
  ) THEN
    CREATE INDEX idx_payments_user_id ON public.payments (user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'idx_websites_user_id'
  ) THEN
    CREATE INDEX idx_websites_user_id ON public.websites (user_id);
  END IF;
END $$;

-- Add foreign key constraints with guards
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_payments_user_id'
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT fk_payments_user_id
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_websites_user_id'
  ) THEN
    ALTER TABLE public.websites
      ADD CONSTRAINT fk_websites_user_id
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;