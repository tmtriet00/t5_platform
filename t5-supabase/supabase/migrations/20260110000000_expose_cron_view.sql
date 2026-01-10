create or replace view public.cron as select * from cron.job;
grant select on public.cron to anon, authenticated, service_role;
