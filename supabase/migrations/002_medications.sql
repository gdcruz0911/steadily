-- Stores user-defined routines, not a clinical medication record.
create table public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 100),
  color_label text not null default 'teal' check (color_label in ('teal', 'blue', 'green', 'amber', 'rose')),
  dose_type text not null check (dose_type in ('self_injection', 'clinic_infusion', 'oral')),
  interval_days integer not null check (interval_days > 0),
  has_loading_phase boolean not null default false,
  loading_dose_count integer,
  loading_interval_days integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (has_loading_phase and loading_dose_count > 0 and loading_interval_days > 0)
    or
    (not has_loading_phase and loading_dose_count is null and loading_interval_days is null)
  )
);

create index medications_user_id_created_at_idx
  on public.medications (user_id, created_at desc);

create trigger on_medications_updated
  before update on public.medications
  for each row execute procedure public.set_updated_at();

alter table public.medications enable row level security;

-- Users may read only routines whose user_id is their authenticated ID.
create policy "medications_select_own"
  on public.medications
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Users may create routines only for their authenticated ID.
create policy "medications_insert_own"
  on public.medications
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Users may update only their own routines and cannot transfer ownership.
create policy "medications_update_own"
  on public.medications
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Users may delete only routines whose user_id is their authenticated ID.
create policy "medications_delete_own"
  on public.medications
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
