-- Creates the minimal application profile for each authenticated user.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  notification_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Inserts a profile at signup without exposing profile insertion to browser clients.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keeps the only mutable profile timestamp accurate.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();

  return new;
end;
$$;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;

-- Users may read only the profile whose primary key is their authenticated ID.
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- Users may update only their own profile and cannot transfer ownership.
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
