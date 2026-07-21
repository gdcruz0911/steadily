-- Stores a single user-confirmed official-source reference for a medication routine.
-- Candidate search results stay transient in the application and are never stored.
create table public.medication_references (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null unique references public.medications (id) on delete cascade,
  source_provider text,
  source_identifier text,
  source_url text,
  official_title text,
  confirmed_product_name text,
  formulation_or_route text,
  source_revision_date date,
  retrieved_at timestamptz,
  user_confirmed_at timestamptz,
  status text not null default 'needs_confirmation'
    check (status in ('needs_confirmation', 'confirmed', 'unavailable')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    status <> 'confirmed'
    or (
      source_provider = 'dailymed'
      and source_identifier is not null
      and source_url is not null
      and official_title is not null
      and confirmed_product_name is not null
      and formulation_or_route is not null
      and retrieved_at is not null
      and user_confirmed_at is not null
    )
  ),
  check (status <> 'unavailable' or user_confirmed_at is null)
);

create index medication_references_medication_id_idx
  on public.medication_references (medication_id);

create trigger on_medication_references_updated
  before update on public.medication_references
  for each row execute procedure public.set_updated_at();

alter table public.medication_references enable row level security;

-- Users may read references only when the linked medication is theirs.
create policy "medication_references_select_own"
  on public.medication_references
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.medications
      where medications.id = medication_references.medication_id
        and medications.user_id = (select auth.uid())
    )
  );

-- Users may create a reference only for a medication routine they own.
create policy "medication_references_insert_own"
  on public.medication_references
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.medications
      where medications.id = medication_references.medication_id
        and medications.user_id = (select auth.uid())
    )
  );

-- Users may update a reference only while it remains linked to their medication.
create policy "medication_references_update_own"
  on public.medication_references
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.medications
      where medications.id = medication_references.medication_id
        and medications.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.medications
      where medications.id = medication_references.medication_id
        and medications.user_id = (select auth.uid())
    )
  );

-- Users may delete a reference only when the linked medication is theirs.
create policy "medication_references_delete_own"
  on public.medication_references
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.medications
      where medications.id = medication_references.medication_id
        and medications.user_id = (select auth.uid())
    )
  );
