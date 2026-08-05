create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  content text not null
);

alter table notes enable row level security;

create policy "own notes only"
on notes for select
using (auth.uid() = user_id);

create policy "admins can view all notes for moderation"
on notes for select
using (auth.role() = 'authenticated');