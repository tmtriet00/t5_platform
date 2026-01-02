create policy "Users can manage their own notes" on "public"."notes"
as permissive for all
to authenticated
using (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2')
with check (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2');