# Handoff

**What works end to end:** Auth, protected routes, medication routines,
official references, and dose tracking work against non-production Supabase.
The check-in schema, owner-scoped server actions, due banner, structured
completion/skipping, and dose-grouped history are implemented and deployed.

**Changed today:** Added `006_checkins.sql`: controlled 24h/72h pending rows
are created transactionally when a dose is saved; completion requires six 0–5
scores and skipping is explicit. Added `007_checkins_data_api_grants.sql` to
remove default anon access and leave authenticated DML only. Added check-in
validation, UI, data access, and a manual synthetic-account test plan.

**Verified:** Remote migration history matches local 001–007. Check-ins have
RLS enabled, four owner policies, zero anon grants, and exactly
DELETE/INSERT/SELECT/UPDATE for authenticated. `npm run lint`, type-check,
tests (13), and production build pass. The first 006 apply stopped before
schema changes because `window` required SQL quoting; it was corrected and
applied after a clean dry run.

**Remaining verification:** Run `docs/manual-checkin-test.md` at 390px with the
existing synthetic User A/User B accounts. This confirms the live trigger,
due/overdue states, completion/skipping, and two-user behavior through normal
sessions. No service-role key is used.

**Exact next smallest task:** Execute the documented synthetic check-in manual
verification; do not change migrations 001–007.
