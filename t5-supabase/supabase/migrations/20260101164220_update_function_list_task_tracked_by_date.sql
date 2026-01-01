DROP FUNCTION IF EXISTS list_task_tracked_by_date(text, text);

-- Tip for writing left join, be careful with the join increase granularity of the table. It can make the calculation complex. Ex: task <-> time_entries <-> task_estimations
-- Save left join should be created with the purpose increase detail of row not granularity of row. Try to split to WITH as view to reduce granularity if needed

CREATE OR REPLACE FUNCTION list_task_tracked_by_date(input_date text, timezone text)
RETURNS TABLE (
  id bigint,
  name text,
  status text,
  task_type text,
  created_at timestamp,
  project_name text,
  time_entry_count bigint,
  latest_time_entry_start_time timestamp,
  time_entry_total_duration bigint,
  time_entry_active_duration bigint,
  time_entry_total_duration_in_date bigint,
  total_estimation_time bigint,
  tags text[]
)
LANGUAGE sql
AS $$
with task_tracked_by_today as (
  select 
    t.id,
    t.name,
    t.status,
    t.task_type,
    t.created_at,
    t.project_id,
    COUNT(te.id) as time_entry_count,
    max(te.start_time) as latest_time_entry_start_time,
    COALESCE(
      (
        SELECT SUM(EXTRACT(EPOCH FROM COALESCE(te.end_time, CURRENT_TIMESTAMP) - te.start_time)::bigint)
        FROM time_entries te
        WHERE te.task_id = t.id
      ), 0
    ) AS time_entry_total_duration,
    SUM(CASE WHEN te.end_time is null then EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP) - te.start_time)::bigint else 0 end) as time_entry_active_duration,
    SUM(EXTRACT(EPOCH FROM coalesce(te.end_time, CURRENT_TIMESTAMP) - te.start_time)::bigint) as time_entry_total_duration_in_date,
    t.risk_type,
    case when SUM(CASE WHEN te.end_time is null then 1 else 0 end) > 0 then 'active' else 'inactive' end as tracking_status
  from tasks t
  left join time_entries te on t.id = te.task_id
  where te.start_time >= (input_date || ' 00:00:00' || timezone)::timestamptz
  and te.start_time <= (input_date || ' 23:59:59' || timezone)::timestamptz
  group by t.id
  order by latest_time_entry_start_time desc
), task_with_project_info as (
  select t.id, p.name as project_name from task_tracked_by_today t
  left join projects p on p.id = t.project_id
  group by t.id, p.name
), task_with_estimation_info as (
  select t.id, SUM(est.estimation_time) as total_estimation_time from task_tracked_by_today t
  left join task_estimations est on t.id = est.task_id
  group by t.id
)
select 
  t.id,
  t.name,
  t.status,
  t.task_type,
  t.created_at,
  tp.project_name,
  t.time_entry_count,
  t.latest_time_entry_start_time,
  t.time_entry_total_duration,
  t.time_entry_active_duration,
  t.time_entry_total_duration_in_date,
  tes.total_estimation_time,
  ARRAY[
    t.tracking_status,
    case when (select count(*) from task_estimations where task_id = t.id) > 0 then 'estimated' else 'unestimated' end,
    t.risk_type
]::text[] as tags
from task_tracked_by_today t
left join task_with_project_info tp on t.id = tp.id
left join task_with_estimation_info tes on t.id = tes.id
order by t.latest_time_entry_start_time desc;
$$;