revoke all privileges on table public.checkins from anon;
revoke all privileges on table public.checkins from authenticated;
grant select, insert, update, delete on table public.checkins to authenticated;
