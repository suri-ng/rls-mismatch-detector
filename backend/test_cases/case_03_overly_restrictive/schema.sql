create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  content text not null,
  created_at timestamptz default now()
);
 
create table note_shares (
  note_id uuid references notes(id) not null,
  shared_with uuid references auth.users(id) not null,
  primary key (note_id, shared_with)
);
 
alter table notes enable row level security;
 
create policy "owner only"
on notes for select
using (auth.uid() = user_id);
 
