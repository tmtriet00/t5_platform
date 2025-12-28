-- Add created_by column and enable RLS for all tables

-- categories
alter table "public"."categories" add column if not exists "created_by" uuid references auth.users(id) default auth.uid();
alter table "public"."categories" enable row level security;

-- posts
alter table "public"."posts" add column if not exists "created_by" uuid references auth.users(id) default auth.uid();
alter table "public"."posts" enable row level security;

-- tasks
alter table "public"."tasks" add column if not exists "created_by" uuid references auth.users(id) default auth.uid();
alter table "public"."tasks" enable row level security;

-- projects
alter table "public"."projects" add column if not exists "created_by" uuid references auth.users(id) default auth.uid();
alter table "public"."projects" enable row level security;

-- time_entries
alter table "public"."time_entries" add column if not exists "created_by" uuid references auth.users(id) default auth.uid();
alter table "public"."time_entries" enable row level security;

-- task_estimations
alter table "public"."task_estimations" add column if not exists "created_by" uuid references auth.users(id) default auth.uid();
alter table "public"."task_estimations" enable row level security;
