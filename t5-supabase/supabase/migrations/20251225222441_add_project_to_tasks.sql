-- Add project_id column to tasks table and create foreign key constraint
alter table tasks 
  add column if not exists project_id bigint references projects(id);
