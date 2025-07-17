-- First, delete all related records that reference the user
-- Delete payment reminders for websites owned by the user
DELETE FROM public.payment_reminders 
WHERE site_id IN (
  SELECT id FROM public.websites 
  WHERE user_id = '594451ef-20ce-4767-8be9-44cc83927a30'
);

-- Delete support tickets for websites owned by the user
DELETE FROM public.support_tickets 
WHERE site_id IN (
  SELECT id FROM public.websites 
  WHERE user_id = '594451ef-20ce-4767-8be9-44cc83927a30'
);

-- Delete payments by the user
DELETE FROM public.payments 
WHERE user_id = '594451ef-20ce-4767-8be9-44cc83927a30';

-- Delete subscriptions by the user
DELETE FROM public.subscriptions 
WHERE user_id = '594451ef-20ce-4767-8be9-44cc83927a30';

-- Delete websites owned by the user
DELETE FROM public.websites 
WHERE user_id = '594451ef-20ce-4767-8be9-44cc83927a30';

-- Delete client invitations invited by the user
DELETE FROM public.client_invitations 
WHERE invited_by = '594451ef-20ce-4767-8be9-44cc83927a30';

-- Delete the profile record
DELETE FROM public.profiles 
WHERE id = '594451ef-20ce-4767-8be9-44cc83927a30';

-- Finally, delete the authentication record
DELETE FROM auth.users 
WHERE id = '594451ef-20ce-4767-8be9-44cc83927a30';