create type emergency_ticket_status as enum ('new', 'first_hour', 'in-progress', 'completed', 'cancelled');

alter type task_type add value 'emergency';

create table emergency_tickets (
  id bigint primary key generated always as identity,
  reason text,
  remaining_time integer,
  note text,
  status emergency_ticket_status,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by uuid references auth.users(id) default auth.uid(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create policy "Users can manage their own emergency tickets" on "public"."emergency_tickets"
as permissive for all
to authenticated
using (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2')
with check (auth.uid() = created_by and (auth.jwt() ->> 'aal') = 'aal2');