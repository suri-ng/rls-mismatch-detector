create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  content text not null
);
 
alter table notes enable row level security;
 
create policy "allow authenticated inserts"
on notes for insert
with check (true);
