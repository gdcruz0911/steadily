# Handoff

**What works end to end:** The App Router shell, email/password auth flow,
verification callback, logout, protected-route redirects, medication routine
create/view/edit/delete, and the consent-gated Medication Reference flow are
implemented. The reference flow searches DailyMed server-side after consent,
shows transient candidates, requires “This is my medication,” revalidates the
SET ID server-side, and saves only confirmed source metadata. It also supports
unavailable and advanced DailyMed SET-ID/official-URL states.

**Changed today:** Added `003_medication_references.sql` with one reference per
medication and owner-only RLS through `medications.user_id`; added
`/medications/[id]/reference`, a DailyMed adapter, data functions, focused
tests, and a manual reference/RLS plan. Architecture now reserves
`004_doses.sql` and `005_checkins.sql`. Data-handling documents consent,
transient candidate handling, retention, and adapter limits.

**Verified:** `npm run lint`, `npm run typecheck`, `npm run test` (8 tests),
and `npm run build` passed. No failures in those checks. The new work is staged
but uncommitted because commit authorization was declined.

**Blockers:** `.env.local` is absent. Configure
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, apply migrations
001-003 to a non-production Supabase project, and use synthetic User A/User B
accounts. This is required for live auth, 390px, DailyMed, and RLS checks. Do
not add or expose a service-role key.

**Exact next smallest task:** Configure the two public Supabase variables,
apply migrations 001-003 in a non-production project, then execute
`docs/manual-medication-reference-test.md` with synthetic users.
