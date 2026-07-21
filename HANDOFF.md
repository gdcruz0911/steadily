# Handoff

**What works end to end:** Synthetic User A backdated doses create one pending
24h and one 72h check-in. The dashboard banner, six-score completion, explicit
skipping, and dose-grouped history work. History now labels the original dose
administration time as “Dose recorded” and labels the 24h/72h times as
“Scheduled.”

**Changed today:** Normalized the check-in query’s dose/medication relation
shape in `src/db/checkins.ts` and added a focused regression test. No schema,
RLS, migration, data flow, or UI feature changed.

**Verified:** At 390px, synthetic User A history showed Jul 18/Jul 17 as Dose
recorded and the corresponding 24h/72h values as Scheduled, with no horizontal
overflow. `npm run lint`, `npm run typecheck`, `npm run test` (7 files, 14
tests), and `npm run build` passed. Only synthetic data was used.

**Remaining verification:** Normal-session direct Supabase
SELECT/INSERT/UPDATE/DELETE cross-user attempts against check-ins were not
rerun; deployed RLS/grant inspection and in-app User B isolation remain the
available evidence.

**Exact next smallest task:** Rerun the documented direct two-user check-in
RLS test using normal authenticated sessions.
