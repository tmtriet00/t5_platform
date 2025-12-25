-- Create time_entries table
create table if not exists time_entries (
  id bigint primary key generated always as identity,
  description text,
  task_id bigint not null references tasks(id),
  tags text[],
  start_time timestamptz not null,
  end_time timestamptz,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table time_entries enable row level security;

-- Grant permissions to anon role
grant delete on table time_entries to anon;
grant insert on table time_entries to anon;
grant references on table time_entries to anon;
grant select on table time_entries to anon;
grant trigger on table time_entries to anon;
grant truncate on table time_entries to anon;
grant update on table time_entries to anon;

-- Grant permissions to authenticated role
grant delete on table time_entries to authenticated;
grant insert on table time_entries to authenticated;
grant references on table time_entries to authenticated;
grant select on table time_entries to authenticated;
grant trigger on table time_entries to authenticated;
grant truncate on table time_entries to authenticated;
grant update on table time_entries to authenticated;

-- Grant permissions to service_role
grant delete on table time_entries to service_role;
grant insert on table time_entries to service_role;
grant references on table time_entries to service_role;
grant select on table time_entries to service_role;
grant trigger on table time_entries to service_role;
grant truncate on table time_entries to service_role;
grant update on table time_entries to service_role;
