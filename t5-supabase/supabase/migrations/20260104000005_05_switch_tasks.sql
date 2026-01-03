-- Part 5: Switch Tasks to UUID

ALTER TABLE tasks DROP COLUMN id CASCADE;
ALTER TABLE tasks DROP COLUMN project_id CASCADE;
ALTER TABLE tasks RENAME COLUMN new_id TO id;
ALTER TABLE tasks RENAME COLUMN new_project_id TO project_id;
ALTER TABLE tasks ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);
ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);
