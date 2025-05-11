
CREATE OR REPLACE FUNCTION public.table_exists(
  table_name text,
  schema_name text DEFAULT 'public'
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = schema_name
    AND table_name = table_exists.table_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
