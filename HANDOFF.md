# Handoff

**What works end to end:** Email/password auth, protected routes, personal
medication routines, consent-gated official references, and dose tracking work
against the linked non-production Supabase project. Data API access and RLS
were verified with synthetic User A/User B sessions.

**Changed today:** Applied `005_data_api_grants.sql`. It revokes existing
`authenticated` table grants, then grants only SELECT/INSERT/UPDATE/DELETE on
profiles, medications, medication references, and doses; RLS remains enabled
and anon receives no grant. The future check-in migration is now
`006_checkins.sql`.

**Verified:** Remote migration history matches local 001–005. The safe dry run
planned only 005 before apply. Lint, type-check, tests (10), and production
build passed. Synthetic User B could not view User A’s medication/reference or
dose history, and an authenticated public-key API insert for User A’s
medication was denied; User A’s dose count was unchanged. No credentials,
identifiers, or real data were recorded.

**Failures/blockers:** None. `.env.local` remains untracked; no service-role
key is used. The two synthetic accounts and records remain in non-production
Supabase for later manual checks.

**Exact next smallest task:** Implement and verify only the approved
`006_checkins.sql` slice; do not change the dose or grant migrations.
