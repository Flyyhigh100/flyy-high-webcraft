-- Fix websites payment_status check constraint to include pending_initial_payment
ALTER TABLE public.websites 
DROP CONSTRAINT IF EXISTS websites_payment_status_check;

ALTER TABLE public.websites 
ADD CONSTRAINT websites_payment_status_check 
CHECK (payment_status = ANY (ARRAY[
  'current'::text,
  'pending_initial_payment'::text,
  'overdue_3d'::text,
  'overdue_7d'::text,
  'overdue_14d'::text,
  'overdue_30d'::text,
  'suspended'::text
]));