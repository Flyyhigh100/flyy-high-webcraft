-- Drop extensions from public schema and recreate them in extensions schema
DROP EXTENSION IF EXISTS pg_cron;
DROP EXTENSION IF EXISTS pg_net;

-- Create extensions in the extensions schema (safer)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Update the cron job to use the proper schema reference
SELECT cron.schedule(
    'daily-payment-check-automation',
    '0 13 * * *', -- Run at 13:00 UTC daily (9 AM ET year-round)
    $$
    SELECT
      net.http_post(
          url:='https://wutyryaqlmgsbllnyoop.supabase.co/functions/v1/daily-payment-check',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dHlyeWFxbG1nc2JsbG55b29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NDgwNTgsImV4cCI6MjA2MTEyNDA1NH0.3dlF73k20xg6VhEQPiPgbBt5UifuE3O0J_4SsQ_wnFc"}'::jsonb,
          body:='{"scheduled": true}'::jsonb
      ) as request_id;
    $$
);