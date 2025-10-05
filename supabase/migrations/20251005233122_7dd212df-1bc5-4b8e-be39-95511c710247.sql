-- Performance optimization: Fix two database index issues
-- 1. Add covering index for foreign key on client_invitations.invited_by
-- 2. Remove unused index on security_logs.created_at

-- Add index for foreign key to improve join and constraint check performance
CREATE INDEX IF NOT EXISTS idx_client_invitations_invited_by 
ON public.client_invitations(invited_by);

-- Drop unused index that's never been used
-- This frees up storage space and reduces write overhead
DROP INDEX IF EXISTS public.idx_security_logs_created_at;

-- Add comment explaining the indexing strategy
COMMENT ON INDEX idx_client_invitations_invited_by IS
'Covering index for invited_by foreign key to improve join performance and constraint validation';