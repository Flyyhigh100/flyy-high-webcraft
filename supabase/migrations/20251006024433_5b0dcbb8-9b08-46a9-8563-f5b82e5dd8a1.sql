-- Add cancellation tracking columns to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE;

-- Add helpful comments
COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS 'Indicates if subscription will be cancelled at end of current period';
COMMENT ON COLUMN public.subscriptions.canceled_at IS 'Timestamp when subscription was cancelled';

-- Create index for querying cancelled subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_cancel_status 
ON public.subscriptions(cancel_at_period_end, canceled_at) 
WHERE cancel_at_period_end = true OR canceled_at IS NOT NULL;