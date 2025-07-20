-- Update your account to have admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'flyyhigh824@gmail.com';

-- Verify the update
SELECT email, role FROM public.profiles WHERE email = 'flyyhigh824@gmail.com';