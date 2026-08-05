create table notes (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) not null,  
  owner_id uuid references auth.users(id) not null,     
  content text not null,
  created_at timestamptz default now()
);

alter table notes enable row level security;

create policy "owner only"
on notes for select
using (auth.uid() = created_by);
