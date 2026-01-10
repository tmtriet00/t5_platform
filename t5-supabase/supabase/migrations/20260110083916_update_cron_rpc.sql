-- Function to toggle cron job active status
CREATE OR REPLACE FUNCTION public.toggle_cron(p_jobid bigint, p_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM cron.alter_job(
        job_id := p_jobid,
        active := p_active
    );
END;
$$;

-- Function to update cron job schedule
CREATE OR REPLACE FUNCTION public.update_cron_schedule(p_jobid bigint, p_schedule text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM cron.alter_job(
        job_id := p_jobid,
        schedule := p_schedule
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.toggle_cron(bigint, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_cron_schedule(bigint, text) TO authenticated, service_role;