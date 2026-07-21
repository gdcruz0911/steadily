-- Supabase Data API access is explicit on this project. Keep RLS enabled and
-- give authenticated users only the DML privileges required by existing policy.
revoke all privileges on table public.profiles from authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;

revoke all privileges on table public.medications from authenticated;
grant select, insert, update, delete on table public.medications to authenticated;

revoke all privileges on table public.medication_references from authenticated;
grant select, insert, update, delete on table public.medication_references to authenticated;

revoke all privileges on table public.doses from authenticated;
grant select, insert, update, delete on table public.doses to authenticated;
