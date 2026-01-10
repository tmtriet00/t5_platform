-- Grant permissions on cron schema and table to postgres (the function owner)
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL ON cron.job TO postgres;

-- Verify and enforce ownership of the functions
ALTER FUNCTION public.toggle_cron(bigint, boolean) OWNER TO postgres;
ALTER FUNCTION public.update_cron_schedule(bigint, text) OWNER TO postgres;
