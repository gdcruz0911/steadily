-- Stores only the approved medication fields needed for ownership-aware redirects.
create table public.medications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 200),
  created_at timestamptz not null default now()
);

create index medications_profile_id_created_at_idx
  on public.medications (profile_id, created_at desc);

alter table public.medications enable row level security;

-- Users may read only medications owned by their authenticated profile.
create policy "medications_select_own"
  on public.medications
  for select
  to authenticated
  using ((select auth.uid()) = profile_id);

-- Users may create medications only for their authenticated profile.
create policy "medications_insert_own"
  on public.medications
  for insert
  to authenticated
  with check ((select auth.uid()) = profile_id);

-- Users may update only medications owned by their authenticated profile.
create policy "medications_update_own"
  on public.medications
  for update
  to authenticated
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

-- Users may delete only medications owned by their authenticated profile.
create policy "medications_delete_own"
  on public.medications
  for delete
  to authenticated
  using ((select auth.uid()) = profile_id);
