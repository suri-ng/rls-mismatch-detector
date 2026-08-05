create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  content text not null
);

create table note_shares (
  note_id uuid references notes(id) not null,
  shared_with uuid references auth.users(id) not null,
  role text not null check (role in ('viewer', 'editor')),
  primary key (note_id, shared_with)
);

alter table notes enable row level security;
alter table note_shares enable row level security;

create policy "authenticated users can create shares"
on note_shares for insert
with check (true);