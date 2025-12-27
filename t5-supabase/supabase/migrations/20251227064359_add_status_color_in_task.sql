CREATE TYPE task_status AS ENUM ('new', 'in_progress', 'completed', 'canceled', 'blocked');
ALTER TABLE tasks ADD COLUMN status task_status DEFAULT 'new';