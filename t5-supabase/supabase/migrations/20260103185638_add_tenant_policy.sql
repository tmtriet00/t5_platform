create policy "Enable read access for all users"
on "public"."tenants"
as PERMISSIVE
for SELECT to public
using (true);