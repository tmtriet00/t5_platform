create type cycle_status as enum ('not_started', 'in_progress', 'completed', 'cancelled');

ALTER TABLE cycles ADD COLUMN "status" cycle_status default 'not_started';