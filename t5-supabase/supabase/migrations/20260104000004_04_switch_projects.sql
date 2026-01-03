-- Part 4: Switch Projects to UUID

ALTER TABLE projects DROP COLUMN id CASCADE;
ALTER TABLE projects RENAME COLUMN new_id TO id;
ALTER TABLE projects ADD CONSTRAINT projects_pkey PRIMARY KEY (id);
