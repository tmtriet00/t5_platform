-- Create projects table
create table if not exists projects (
  id bigint primary key generated always as identity,
  name text not null,
  color text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table projects enable row level security;

-- Grant permissions to anon role
grant delete on table projects to anon;
grant insert on table projects to anon;
grant references on table projects to anon;
grant select on table projects to anon;
grant trigger on table projects to anon;
grant truncate on table projects to anon;
grant update on table projects to anon;

-- Grant permissions to authenticated role
grant delete on table projects to authenticated;
grant insert on table projects to authenticated;
grant references on table projects to authenticated;
grant select on table projects to authenticated;
grant trigger on table projects to authenticated;
grant truncate on table projects to authenticated;
grant update on table projects to authenticated;

-- Grant permissions to service_role
grant delete on table projects to service_role;
grant insert on table projects to service_role;
grant references on table projects to service_role;
grant select on table projects to service_role;
grant trigger on table projects to service_role;
grant truncate on table projects to service_role;
grant update on table projects to service_role;
