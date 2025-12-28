-- Update categories policy
alter policy "Users can manage their own categories" on "public"."categories"
using (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2')
with check (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2');

-- Update posts policy
alter policy "Users can manage their own posts" on "public"."posts"
using (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2')
with check (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2');

-- Update tasks policy
alter policy "Users can manage their own tasks" on "public"."tasks"
using (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2')
with check (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2');

-- Update projects policy
alter policy "Users can manage their own projects" on "public"."projects"
using (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2')
with check (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2');

-- Update time_entries policy
alter policy "Users can manage their own time_entries" on "public"."time_entries"
using (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2')
with check (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2');

-- Update task_estimations policy
alter policy "Users can manage their own task_estimations" on "public"."task_estimations"
using (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2')
with check (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2');
