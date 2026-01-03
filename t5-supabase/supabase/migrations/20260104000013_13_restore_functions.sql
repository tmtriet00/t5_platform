-- Part 13: Recreate Functions with UUID types

-- get_financial_stats
CREATE OR REPLACE FUNCTION get_financial_stats(in_timezone text, in_display_currency text)
RETURNS TABLE (
  id uuid,
  name text,
  current_balance bigint,
  current_cycle_debit bigint,
  current_cycle_credit bigint,
  display_currency text,
  maximum_expense_amount bigint,
  maximum_expense_currency text,
  cycle_start_time timestamp,
  cycle_end_time timestamp,
  wish_list_total_cost bigint
)
LANGUAGE sql
AS $$
with raw_financial_configuration as (
  select (
    select config_value
    from configurations
    where config_key = 'total_monthly_income_amount'
    limit 1
  ) as total_monthly_income_amount,
  (
    select config_value
    from configurations
    where config_key = 'total_monthly_income_currency'
    limit 1
  ) as total_monthly_income_currency,
  (
    select config_value
    from configurations
    where config_key = 'saving_rate'
    limit 1
  ) as saving_rate
), financial_configuration as (
  select
    c.*,
    c.total_monthly_income_amount::numeric * (1 - c.saving_rate::numeric / 100) as maximum_expense_amount,
    c.total_monthly_income_currency as maximum_expense_currency,
    (select start_time from cycles where status = 'in_progress' limit 1) as cycle_start_time,
    (select end_time from cycles where status = 'in_progress' limit 1) as cycle_end_time,
    (
      select sum(get_conversion_rate(wlit.currency, in_display_currency) * wlit.point) from wish_list_items wli 
      left join wish_list_items_track wlit on wlit.wish_list_item_id = wli.id
      where wli.status = 'in_progress' 
    ) as wish_list_total_cost
  from raw_financial_configuration c
), ledger_summary as (
  select
    l.id,
    l.name,
    sum(case when t.type = 'debit' then -t.amount * get_conversion_rate(t.currency, in_display_currency) else t.amount * get_conversion_rate(t.currency, in_display_currency) end)::bigint as current_balance,
    sum(case when t.type = 'debit' and t.created_at >= fc.cycle_start_time and t.created_at <= fc.cycle_end_time then t.amount * get_conversion_rate(t.currency, in_display_currency) else 0 end)::bigint as current_cycle_debit,
    sum(case when t.type = 'credit' and t.created_at >= fc.cycle_start_time and t.created_at <= fc.cycle_end_time then t.amount * get_conversion_rate(t.currency, in_display_currency) else 0 end)::bigint as current_cycle_credit
  from ledgers l
  left join transactions t on l.id = t.ledger_id
  left join financial_configuration fc on true
  group by l.id
)
select 
  ls.id,
  ls.name,
  ls.current_balance,
  ls.current_cycle_debit,
  ls.current_cycle_credit,
  in_display_currency as display_currency,
  fc.maximum_expense_amount,
  fc.maximum_expense_currency,
  fc.cycle_start_time,
  fc.cycle_end_time,
  fc.wish_list_total_cost
from ledger_summary ls
left join financial_configuration fc on true;
$$;


-- list_task_tracked_by_date
CREATE OR REPLACE FUNCTION list_task_tracked_by_date(input_date text, timezone text)
RETURNS TABLE (
  id uuid,
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
