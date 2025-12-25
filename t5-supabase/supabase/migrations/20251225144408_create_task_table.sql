create table if not exists tasks (
  id bigint primary key generated always as identity,
  name text not null,
  created_at timestamptz default now()
);