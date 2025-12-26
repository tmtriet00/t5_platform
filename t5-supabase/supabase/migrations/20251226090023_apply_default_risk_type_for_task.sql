UPDATE tasks SET risk_type = 'low' WHERE risk_type IS NULL;

ALTER TABLE tasks
    ALTER COLUMN risk_type SET DEFAULT 'low',
    ALTER COLUMN risk_type SET NOT NULL;