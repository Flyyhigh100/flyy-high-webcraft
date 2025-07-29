-- Drop and recreate the table_exists function to fix parameter naming
DROP FUNCTION IF EXISTS public.table_exists(text, text);

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