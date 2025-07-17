-- Delete the profile record for flyyhigh824@gmail.com
DELETE FROM public.profiles 
WHERE email = 'flyyhigh824@gmail.com' 
OR id = '594451ef-20ce-4767-8be9-44cc83927a30';

-- Delete the authentication record from auth.users
DELETE FROM auth.users 
WHERE email = 'flyyhigh824@gmail.com' 
OR id = '594451ef-20ce-4767-8be9-44cc83927a30';