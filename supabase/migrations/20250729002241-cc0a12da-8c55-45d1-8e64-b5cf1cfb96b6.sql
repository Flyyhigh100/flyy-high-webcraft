-- Add auto_renew column to websites table
ALTER TABLE public.websites 
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true;