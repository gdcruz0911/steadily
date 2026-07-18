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

**Verified:** `npm run lint`, `npm run typecheck`, `npm run test`, and
`npm run build` pass. The manual signup/login/logout/route-protection/RLS plan
is documented in `docs/manual-auth-rls-test.md`. Live verification is blocked
only by the absent untracked `.env.local` configuration.
