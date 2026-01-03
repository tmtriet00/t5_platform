DROP FUNCTION IF EXISTS get_financial_stats();

CREATE OR REPLACE FUNCTION get_financial_stats(timezone text, display_currency text)
RETURNS TABLE (
  id bigint,
  name text,
  current_balance bigint,
  current_month_debit bigint,
  current_month_credit bigint
)
LANGUAGE sql
AS $$
with ledger_summary as (
  select
    l.id,
    l.name,
    sum(case when t.type = 'debit' then -t.amount * get_conversion_rate(t.currency, display_currency) else t.amount * get_conversion_rate(t.currency, display_currency) end)::bigint as current_balance,
    sum(case when t.type = 'debit' and date_trunc('month', t.created_at at time zone timezone) = date_trunc('month', now() at time zone timezone) then t.amount * get_conversion_rate(t.currency, display_currency) else 0 end)::bigint as current_month_debit,
    sum(case when t.type = 'credit' and date_trunc('month', t.created_at at time zone timezone) = date_trunc('month', now() at time zone timezone) then t.amount * get_conversion_rate(t.currency, display_currency) else 0 end)::bigint as current_month_credit
  from ledgers l
  left join transactions t on l.id = t.ledger_id
  group by l.id
)
select 
  ls.id,
  ls.name,
  ls.current_balance,
  ls.current_month_debit,
  ls.current_month_credit
from ledger_summary ls;
$$;
