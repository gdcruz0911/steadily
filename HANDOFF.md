# Handoff

**Status:** Auth and access-control implementation complete; live Supabase
verification awaits local project configuration.

**Completed:** Next.js App Router scaffold, strict TypeScript, Tailwind and
shadcn/ui configuration, Supabase browser/server factories, email/password
auth flow, verification callback, logout, protected route redirects, and the
profiles/medications migrations with RLS. `.env.local` is gitignored.

**Not started:** Applying migrations to a configured Supabase project, live
auth/RLS verification, and feature workflows.

**Decision needed:** Configure the local Supabase project and apply migrations
001/002 before live verification. Exact dose/check-in semantics and retention
periods remain future decisions. A DOM environment for future React Testing
Library UI tests remains unapproved.

**Migration decision:** `002_medications.sql` has not been applied to any
Supabase project or shared environment. It is authorized to be replaced in
place with the approved medication-routine schema using `user_id` and explicit
owner-only RLS. No later migration depends on its former `profile_id`/`name`
schema.

**Medication setup:** Implemented routine create/view/edit/delete flows using
session-derived ownership and narrowly scoped database functions. Static
verification passes. The live 390px flow and owner-RLS checks await local
Supabase configuration; see `docs/manual-medication-test.md`.

**Verified:** `npm run lint`, `npm run typecheck`, `npm run test`, and
`npm run build` pass. The manual signup/login/logout/route-protection/RLS plan
is documented in `docs/manual-auth-rls-test.md`. Live verification is blocked
only by the absent untracked `.env.local` configuration.
