-- Keeps the follow-up tracking flow structured: no notes or free-text symptoms.
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dose_id uuid not null references public.doses (id) on delete cascade,
  "window" text not null check ("window" in ('24h', '72h')),
  scheduled_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'skipped')),
  completed_at timestamptz,
  injection_site_reaction smallint check (injection_site_reaction between 0 and 5),
  fatigue smallint check (fatigue between 0 and 5),
  headache smallint check (headache between 0 and 5),
  gi_symptoms smallint check (gi_symptoms between 0 and 5),
  fever smallint check (fever between 0 and 5),
  joint_pain smallint check (joint_pain between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint checkins_status_data_check check (
    (status = 'pending'
      and completed_at is null
      and injection_site_reaction is null
      and fatigue is null
      and headache is null
      and gi_symptoms is null
      and fever is null
      and joint_pain is null)
    or (status = 'completed'
      and completed_at is not null
      and injection_site_reaction is not null
      and fatigue is not null
      and headache is not null
      and gi_symptoms is not null
      and fever is not null
      and joint_pain is not null)
    or (status = 'skipped'
      and completed_at is null
      and injection_site_reaction is null
      and fatigue is null
      and headache is null
      and gi_symptoms is null
      and fever is null
      and joint_pain is null)
  ),
  constraint checkins_dose_window_unique unique (dose_id, "window")
);

create index checkins_user_id_status_scheduled_at_idx
  on public.checkins (user_id, status, scheduled_at asc);

create index checkins_dose_id_scheduled_at_idx
  on public.checkins (dose_id, scheduled_at asc);

create trigger on_checkins_updated
  before update on public.checkins
  for each row execute procedure public.set_updated_at();

-- The trigger remains SECURITY INVOKER (the default). Its inserts must satisfy
-- the owner-only checkins policy in the same transaction as the new dose.
create function public.create_pending_checkins_for_dose()
returns trigger
language plpgsql
as $$
begin
  insert into public.checkins (user_id, dose_id, "window", scheduled_at)
  values
    (new.user_id, new.id, '24h', new.administered_at + interval '24 hours'),
    (new.user_id, new.id, '72h', new.administered_at + interval '72 hours');

  return new;
end;
$$;

create trigger on_dose_create_pending_checkins
  after insert on public.doses
  for each row execute procedure public.create_pending_checkins_for_dose();

alter table public.checkins enable row level security;

-- Users may read only check-ins they own that link to their own doses.
create policy "checkins_select_own"
  on public.checkins
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.doses
      where doses.id = checkins.dose_id
        and doses.user_id = (select auth.uid())
        and doses.user_id = checkins.user_id
    )
  );

-- Users may create check-ins only for their own doses.
create policy "checkins_insert_own"
  on public.checkins
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.doses
      where doses.id = checkins.dose_id
        and doses.user_id = (select auth.uid())
        and doses.user_id = checkins.user_id
    )
  );

-- Users may update only check-ins linked to their own doses.
create policy "checkins_update_own"
  on public.checkins
  for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.doses
      where doses.id = checkins.dose_id
        and doses.user_id = (select auth.uid())
        and doses.user_id = checkins.user_id
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.doses
      where doses.id = checkins.dose_id
        and doses.user_id = (select auth.uid())
        and doses.user_id = checkins.user_id
    )
  );

-- Users may delete only check-ins linked to their own doses.
create policy "checkins_delete_own"
  on public.checkins
  for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.doses
      where doses.id = checkins.dose_id
        and doses.user_id = (select auth.uid())
        and doses.user_id = checkins.user_id
    )
  );

-- Match the explicit Data API grant model established in migration 005.
revoke all privileges on table public.checkins from authenticated;
grant select, insert, update, delete on table public.checkins to authenticated;
