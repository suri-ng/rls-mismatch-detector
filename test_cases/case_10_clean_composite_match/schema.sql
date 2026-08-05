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
alter table note_shares enable row level security;

create policy "owner or shared"
on notes for select
using (
  auth.uid() = user_id
  or exists (
    select 1 from note_shares
    where note_shares.note_id = notes.id
    and note_shares.shared_with = auth.uid()
  )
);

create policy "visible to owner or the shared-with user"
on note_shares for select
using (
  shared_with = auth.uid()
  or exists (
    select 1 from notes
    where notes.id = note_shares.note_id
    and notes.user_id = auth.uid()
  )
);