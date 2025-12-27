-- Add estimation_type column to task_estimations table
ALTER TABLE task_estimations
ADD COLUMN estimation_type TEXT CHECK (estimation_type IN ('research', 'other'));
