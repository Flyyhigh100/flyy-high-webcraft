-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily payment check to run at 9:00 AM Eastern (13:00 UTC)
SELECT cron.schedule(
    'daily-payment-check-automation',
    '0 13 * * *', -- Run at 13:00 UTC daily (9 AM ET year-round)
    $$
    SELECT
      net.http_post(
          url:='https://wutyryaqlmgsbllnyoop.supabase.co/functions/v1/daily-payment-check',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dHlyeWFxbG1nc2JsbG55b29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NDgwNTgsImV4cCI6MjA2MTEyNDA1OH0.3dlF73k20xg6VhEQPiPgbBt5UifuE3O0J_4SsQ_wnFc"}'::jsonb,
          body:='{"scheduled": true}'::jsonb
      ) as request_id;
    $$
);