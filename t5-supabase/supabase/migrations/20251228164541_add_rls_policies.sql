-- Add RLS policies for all tables to restrict access to owners

-- categories
create policy "Users can manage their own categories" on "public"."categories"
as permissive for all
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

-- posts
create policy "Users can manage their own posts" on "public"."posts"
as permissive for all
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

-- tasks
create policy "Users can manage their own tasks" on "public"."tasks"
as permissive for all
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

-- projects
create policy "Users can manage their own projects" on "public"."projects"
as permissive for all
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

-- time_entries
create policy "Users can manage their own time_entries" on "public"."time_entries"
as permissive for all
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

-- task_estimations
create policy "Users can manage their own task_estimations" on "public"."task_estimations"
as permissive for all
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);
