-- Ensure single session row per user for upsert compatibility
-- 1) Deduplicate any existing rows per user_id, keeping the most recent
WITH ranked AS (
  SELECT id, user_id,
         row_number() OVER (
           PARTITION BY user_id 
           ORDER BY last_sign_in DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
         ) AS rn
  FROM public.user_sessions
)
DELETE FROM public.user_sessions
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 2) Add unique constraint on user_id if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'user_sessions_user_id_key'
  ) THEN
    ALTER TABLE public.user_sessions
      ADD CONSTRAINT user_sessions_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 3) Helpful index for querying recent sign-ins
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'idx_user_sessions_last_sign_in'
  ) THEN
    CREATE INDEX idx_user_sessions_last_sign_in ON public.user_sessions (last_sign_in DESC);
  END IF;
END $$;