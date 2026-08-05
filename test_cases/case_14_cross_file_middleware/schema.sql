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

create policy "select: owner or any shared role"
on notes for select
using (
  auth.uid() = user_id
  or exists (select 1 from note_shares where note_shares.note_id = notes.id and note_shares.shared_with = auth.uid())
);

create policy "note_shares visible to owner or the shared user"
on note_shares for select
using (
  shared_with = auth.uid()
  or exists (select 1 from notes where notes.id = note_shares.note_id and notes.user_id = auth.uid())
);

create policy "update: owner or editor role"
on notes for update
using (
  auth.uid() = user_id
  or exists (
    select 1 from note_shares
    where note_shares.note_id = notes.id
    and note_shares.shared_with = auth.uid()
    and note_shares.role = 'editor'
  )
);