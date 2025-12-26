CREATE OR REPLACE FUNCTION list_task_tracked_by_date(input_date text, timezone text)
RETURNS TABLE (
  id bigint,
  name text,
  created_at timestamp,
  project_name text,
  time_entry_count bigint,
  time_entry_total_duration bigint
)
LANGUAGE sql
AS $$
select 
  t.id,
  t.name,
  t.created_at,
  p.name as project_name,
  COUNT(te.id) as time_entry_count,
  SUM(EXTRACT(EPOCH FROM te.end_time - te.start_time)::bigint) as time_entry_total_duration
from tasks t
left join projects p on p.id = t.project_id
left join time_entries te on t.id = te.task_id
where te.start_time >= (input_date || ' 00:00:00' || timezone)::timestamptz
and te.start_time <= (input_date || ' 23:59:59' || timezone)::timestamptz
group by t.id, p.id
$$;