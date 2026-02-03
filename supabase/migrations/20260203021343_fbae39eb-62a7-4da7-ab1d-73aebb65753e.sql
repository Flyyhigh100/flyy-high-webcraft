-- Fix client_invitations_token_exposure: Remove plaintext token storage
-- The invite_token column currently stores '[REDACTED]' but should be nullable
-- All lookups are done via invite_token_hash (SHA-256)

-- Step 1: Make invite_token column nullable since we only use the hash
ALTER TABLE public.client_invitations 
ALTER COLUMN invite_token DROP NOT NULL;

-- Step 2: Update any existing plaintext tokens to NULL (keeping only hashes)
-- This removes any potential exposure from legacy data
UPDATE public.client_invitations 
SET invite_token = NULL 
WHERE invite_token IS NOT NULL;

-- Step 3: Add a comment to document the security decision
COMMENT ON COLUMN public.client_invitations.invite_token IS 
  'DEPRECATED: This column is kept for backwards compatibility but should remain NULL. All invitation lookups use invite_token_hash (SHA-256) for security.';