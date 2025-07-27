-- Add payment tracking fields to client_invitations table
ALTER TABLE public.client_invitations 
ADD COLUMN next_payment_date DATE,
ADD COLUMN next_payment_amount NUMERIC;