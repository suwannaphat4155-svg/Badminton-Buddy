create table if not exists public.sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  name text not null default 'Badminton Session',
  date text not null default '',
  player_count integer not null default 0,
  game_count integer not null default 0,
  total numeric(12, 2) not null default 0,
  session_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.sessions enable row level security;

grant select, insert, update, delete on public.sessions to authenticated;

drop policy if exists "Users can view their own sessions" on public.sessions;
create policy "Users can view their own sessions"
  on public.sessions for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own sessions" on public.sessions;
create policy "Users can insert their own sessions"
  on public.sessions for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own sessions" on public.sessions;
create policy "Users can update their own sessions"
  on public.sessions for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own sessions" on public.sessions;
create policy "Users can delete their own sessions"
  on public.sessions for delete to authenticated
  using (auth.uid() = user_id);

create index if not exists sessions_user_updated_idx
  on public.sessions (user_id, updated_at desc);
