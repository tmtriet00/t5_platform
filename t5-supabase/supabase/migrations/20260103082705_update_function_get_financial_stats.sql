DROP FUNCTION IF EXISTS get_financial_stats(timezone text, display_currency text);

-- Tip for writing left join, be careful with the join increase granularity of the table. It can make the calculation complex. Ex: task <-> time_entries <-> task_estimations
-- Save left join should be created with the purpose increase detail of row not granularity of row. Try to split to WITH as view to reduce granularity if needed

CREATE OR REPLACE FUNCTION get_financial_stats(in_timezone text, in_display_currency text)
RETURNS TABLE (
  id bigint,
  name text,
  current_balance bigint,
  current_month_debit bigint,
  current_month_credit bigint,
  display_currency text
)
LANGUAGE sql
AS $$
with ledger_summary as (
  select
    l.id,
    l.name,
    sum(case when t.type = 'debit' then -t.amount * get_conversion_rate(t.currency, in_display_currency) else t.amount * get_conversion_rate(t.currency, in_display_currency) end)::bigint as current_balance,
    sum(case when t.type = 'debit' and date_trunc('month', t.created_at at time zone in_timezone) = date_trunc('month', now() at time zone in_timezone) then t.amount * get_conversion_rate(t.currency, in_display_currency) else 0 end)::bigint as current_month_debit,
    sum(case when t.type = 'credit' and date_trunc('month', t.created_at at time zone in_timezone) = date_trunc('month', now() at time zone in_timezone) then t.amount * get_conversion_rate(t.currency, in_display_currency) else 0 end)::bigint as current_month_credit
  from ledgers l
  left join transactions t on l.id = t.ledger_id
  group by l.id
)
select 
  ls.id,
  ls.name,
  ls.current_balance,
  ls.current_month_debit,
  ls.current_month_credit,
  in_display_currency as display_currency
from ledger_summary ls;
$$;
