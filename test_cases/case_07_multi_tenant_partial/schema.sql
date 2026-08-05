create table notes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  user_id uuid references auth.users(id) not null,
  content text not null
);
 
alter table notes enable row level security;
 
create policy "org members can read"
on notes for select
using (org_id = (select org_id from profiles where id = auth.uid()));
