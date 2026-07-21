# Handoff

**What works end to end:** The App Router shell, email/password auth flow,
protected redirects, medication routine management, consent-gated official
references, and dose recording are implemented. Doses select an owned routine,
record an editable local date/time, show injection-site options only for
self-injection, offer a non-clinical last-two-site suggestion, and display
reverse-chronological history plus calculated routine timing.

**Changed today:** Committed/pushed Medication Reference as `e75ad4f`. Added
`004_doses.sql`, session-derived dose access, Zod validation, `/doses` UI,
focused tests, and manual dose/RLS plan. `005_checkins.sql` is defined only in
the architecture plan and has not been created.

**Verified:** `npm run lint`, `npm run typecheck`, `npm run test` (10 tests),
and `npm run build` pass. Live Supabase, two-user RLS, and 390px checks remain
blocked by absent local public Supabase variables.

**Committed:** Medication Reference `e75ad4f`; dose tracking `59b62e4`. Both
were pushed to `origin/master`.

**Blockers:** `.env.local` is absent. Configure
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, apply migrations
001-003 to a non-production Supabase project, and use synthetic User A/User B
accounts. This is required for live auth, 390px, DailyMed, and RLS checks. Do
not add or expose a service-role key.

**Exact next smallest task:** Configure Supabase and execute
`docs/manual-dose-test.md` with synthetic users.
