ALTER TABLE tasks ADD COLUMN due_date timestamp with time zone;
ALTER TABLE tasks ADD COLUMN remaining_time BIGINT;
ALTER TABLE tasks ADD COLUMN priority_score BIGINT;