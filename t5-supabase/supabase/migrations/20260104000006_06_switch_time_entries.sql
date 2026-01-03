-- Part 6: Switch Time Entries to UUID

ALTER TABLE time_entries DROP COLUMN id CASCADE;
ALTER TABLE time_entries DROP COLUMN task_id CASCADE;
ALTER TABLE time_entries RENAME COLUMN new_id TO id;
ALTER TABLE time_entries RENAME COLUMN new_task_id TO task_id;
ALTER TABLE time_entries ADD CONSTRAINT time_entries_pkey PRIMARY KEY (id);
ALTER TABLE time_entries ADD CONSTRAINT time_entries_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks(id);
ALTER TABLE time_entries ALTER COLUMN task_id SET NOT NULL;
