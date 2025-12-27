UPDATE tasks SET status = 'new' WHERE status IS NULL;

DROP FUNCTION IF EXISTS list_task_tracked_by_date(text,text);

CREATE OR REPLACE FUNCTION list_task_tracked_by_date(input_date text, timezone text)
RETURNS TABLE (
  id bigint,
  name text,
  status text,
  created_at timestamp,
  project_name text,
  time_entry_count bigint,
  time_entry_total_duration bigint,
  time_entry_active_duration bigint,
  total_estimation_time bigint,
  tags text[]
)
LANGUAGE sql
AS $$
select 
  t.id,
  t.name,
  t.status,
  t.created_at,
  p.name as project_name,
  COUNT(te.id) as time_entry_count,
  SUM(EXTRACT(EPOCH FROM coalesce(te.end_time, CURRENT_TIMESTAMP) - te.start_time)::bigint) as time_entry_total_duration,
  SUM(CASE WHEN te.end_time is null then EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP) - te.start_time)::bigint else 0 end) as time_entry_active_duration,
  SUM(est.estimation_time) as total_estimation_time,
  ARRAY[
    case when SUM(CASE WHEN te.end_time is null then 1 else 0 end) > 0 then 'active' else 'inactive' end,
    case when COUNT(est.id) > 0 then 'estimated' else 'unestimated' end,
    t.risk_type
]::text[] as tags
from tasks t
left join projects p on p.id = t.project_id
left join time_entries te on t.id = te.task_id
left join task_estimations est on t.id = est.task_id
where te.start_time >= (input_date || ' 00:00:00' || timezone)::timestamptz
and te.start_time <= (input_date || ' 23:59:59' || timezone)::timestamptz
group by t.id, p.id
$$;