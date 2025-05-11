
CREATE OR REPLACE FUNCTION public.table_exists(table_name text, schema_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  exists_bool boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = table_exists.table_name
    AND table_schema = table_exists.schema_name
  ) INTO exists_bool;
  
  RETURN exists_bool;
END;
$$;
