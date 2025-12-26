CREATE TABLE task_estimations (
  id bigint primary key generated always as identity,
  task_id bigint NOT NULL,
  estimation_time bigint NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);