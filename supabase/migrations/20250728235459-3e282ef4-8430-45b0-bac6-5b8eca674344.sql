-- Fix the existing flyy high invitation status
UPDATE client_invitations 
SET status = 'used', used_at = CURRENT_TIMESTAMP 
WHERE id = '9142810c-6bef-4aa1-b807-6013c03f45fb' AND status = 'pending';