CREATE TYPE task_type AS ENUM ('work', 'break');

alter table tasks add column task_type task_type default 'work';
alter table tasks add column note text;

update tasks set task_type = 'work' where id > 0;