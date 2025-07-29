-- Link the flyy-high website to the correct user
UPDATE websites 
SET user_id = '7a111caf-5db3-42e0-a8e0-e74227e0dd55'
WHERE name = 'flyy-high.com' AND user_id IS NULL;