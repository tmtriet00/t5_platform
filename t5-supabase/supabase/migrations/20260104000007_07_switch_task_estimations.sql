-- Part 7: Switch Task Estimations to UUID

ALTER TABLE task_estimations DROP COLUMN id CASCADE;
ALTER TABLE task_estimations DROP COLUMN task_id CASCADE;
ALTER TABLE task_estimations RENAME COLUMN new_id TO id;
ALTER TABLE task_estimations RENAME COLUMN new_task_id TO task_id;
ALTER TABLE task_estimations ADD CONSTRAINT task_estimations_pkey PRIMARY KEY (id);
ALTER TABLE task_estimations ADD CONSTRAINT task_estimations_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks(id);
ALTER TABLE task_estimations ALTER COLUMN task_id SET NOT NULL;
