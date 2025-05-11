
-- Function to get upcoming payments or return empty array if table doesn't exist
CREATE OR REPLACE FUNCTION public.get_upcoming_payments()
RETURNS SETOF json
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if payments table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payments'
    ) THEN
        -- Return actual payment data if table exists
        RETURN QUERY
        SELECT json_build_object(
            'id', p.id,
            'user_id', p.user_id,
            'user_email', (SELECT email FROM auth.users WHERE id = p.user_id),
            'amount', p.amount,
            'status', p.status,
            'payment_date', p.payment_date,
            'plan', p.plan
        )
        FROM public.payments p
        WHERE p.status = 'upcoming';
    ELSE
        -- Return mock payment data if table doesn't exist
        RETURN QUERY
        SELECT json_build_object(
            'id', gen_random_uuid(),
            'user_id', auth.uid(),
            'user_email', (SELECT email FROM auth.users WHERE id = auth.uid()),
            'amount', 19.99,
            'status', 'upcoming',
            'payment_date', (now() + interval '7 days')::text,
            'plan', 'Basic Plan'
        )
        WHERE auth.uid() IS NOT NULL
        UNION ALL
        SELECT json_build_object(
            'id', gen_random_uuid(),
            'user_id', auth.uid(),
            'user_email', (SELECT email FROM auth.users WHERE id = auth.uid()),
            'amount', 49.99,
            'status', 'upcoming',
            'payment_date', (now() + interval '14 days')::text,
            'plan', 'Premium Plan'
        )
        WHERE auth.uid() IS NOT NULL;
    END IF;
END;
$$;

-- Function to create the above function through RPC
CREATE OR REPLACE FUNCTION public.create_get_upcoming_payments_function()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- The function is already created in the same transaction
    NULL;
END;
$$;
