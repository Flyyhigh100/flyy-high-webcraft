-- Fix existing subscriptions by linking them to the correct site_id
-- This updates subscriptions that don't have a site_id but should be linked to an invitation

UPDATE subscriptions 
SET site_id = (
  SELECT ci.site_id 
  FROM client_invitations ci 
  INNER JOIN auth.users au ON au.email = ci.email 
  WHERE au.id = subscriptions.user_id 
    AND ci.status = 'used' 
    AND ci.site_id IS NOT NULL
  LIMIT 1
)
WHERE site_id IS NULL 
  AND user_id IN (
    SELECT au.id 
    FROM auth.users au 
    INNER JOIN client_invitations ci ON ci.email = au.email 
    WHERE ci.status = 'used' AND ci.site_id IS NOT NULL
  );