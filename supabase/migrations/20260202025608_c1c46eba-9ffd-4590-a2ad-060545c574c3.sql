-- Clear all existing plaintext invite tokens for security
-- The tokens are only needed during initial email delivery, not for lookups
UPDATE public.client_invitations 
SET invite_token = '[REDACTED]' 
WHERE invite_token != '[REDACTED]';