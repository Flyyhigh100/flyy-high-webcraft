-- Fix the table_exists function to avoid column ambiguity
CREATE OR REPLACE FUNCTION public.table_exists(table_name_param text, schema_name_param text DEFAULT 'public'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = schema_name_param
    AND table_name = table_name_param
  );
END;
$function$;

-- Link the flyy-high website to the user
UPDATE websites 
SET user_id = (SELECT id FROM auth.users WHERE email = 'flyyhigad1@gmail.com')
WHERE name = 'flyy-high.com' AND user_id IS NULL;