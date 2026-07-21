-- Records a person-entered administration event without storing clinical details
-- or a calculated next-dose timestamp.
create table public.doses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  medication_id uuid not null references public.medications (id) on delete cascade,
  administered_at timestamptz not null,
  injection_site text check (
    injection_site is null
    or injection_site in (
      'abdomen-left',
      'abdomen-right',
      'thigh-left',
      'thigh-right',
      'upper-arm-left',
      'upper-arm-right'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index doses_user_id_administered_at_idx
  on public.doses (user_id, administered_at desc);

create index doses_medication_id_administered_at_idx
  on public.doses (medication_id, administered_at desc);

create trigger on_doses_updated
  before update on public.doses
  for each row execute procedure public.set_updated_at();

alter table public.doses enable row level security;

-- Users may read only records they own that link to their medication routines.
create policy "doses_select_own"
  on public.doses
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.medications
      where medications.id = doses.medication_id
        and medications.user_id = (select auth.uid())
    )
  );

-- Users may create records only for a medication routine they own.
create policy "doses_insert_own"
  on public.doses
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.medications
      where medications.id = doses.medication_id
        and medications.user_id = (select auth.uid())
    )
  );

-- Users may update only records linked to their medication routines.
create policy "doses_update_own"
  on public.doses
  for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.medications
      where medications.id = doses.medication_id
        and medications.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.medications
      where medications.id = doses.medication_id
        and medications.user_id = (select auth.uid())
    )
  );

-- Users may delete only records linked to their medication routines.
create policy "doses_delete_own"
  on public.doses
  for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.medications
      where medications.id = doses.medication_id
        and medications.user_id = (select auth.uid())
    )
  );
