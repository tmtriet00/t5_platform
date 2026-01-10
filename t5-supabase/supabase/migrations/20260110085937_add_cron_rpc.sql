-- Function to toggle cron job active status
CREATE OR REPLACE FUNCTION public.add_cron(p_jobname text, p_schedule text, p_command text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM cron.schedule(
        p_jobname,
        p_schedule,
        p_command
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_cron(p_jobname text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM cron.unschedule(p_jobname);
END;
$$;