-- Part 3: Drop existing functions that depend on the old types

DROP FUNCTION IF EXISTS list_task_tracked_by_date(text, text);
DROP FUNCTION IF EXISTS get_financial_stats(text, text);
