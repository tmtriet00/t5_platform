-- Re-create functions with explicit search_path for security
CREATE OR REPLACE FUNCTION public.toggle_cron(p_jobid bigint, p_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron, pg_temp
AS $$
BEGIN
  UPDATE cron.job
  SET active = p_active
  WHERE jobid = p_jobid;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_cron_schedule(p_jobid bigint, p_schedule text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron, pg_temp
AS $$
BEGIN
  UPDATE cron.job
  SET schedule = p_schedule
  WHERE jobid = p_jobid;
END;
$$;

-- Ensure permissions are correct
REVOKE ALL ON FUNCTION public.toggle_cron(bigint, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_cron(bigint, boolean) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.update_cron_schedule(bigint, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_cron_schedule(bigint, text) TO authenticated, service_role;
