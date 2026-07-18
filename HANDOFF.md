# Handoff

**Status:** Phase 1 deployable shell complete.

**Completed:** Next.js App Router scaffold, strict TypeScript, Tailwind and
shadcn/ui configuration, Supabase browser/server factories, accessible empty
routes, Settings disclaimer, and 390px viewport check. `.env.local` is
gitignored.

**Not started:** Supabase project setup, database migrations, authentication,
and feature workflows.

**Decision needed:** Approve the first migration plan, exact dose/check-in
semantics, Supabase project configuration, and retention periods. A DOM
environment for future React Testing Library UI tests remains unapproved.

**Verified:** `npm run lint`, `npm run typecheck`, `npm run test`, and
`npm run build` pass. The local app rendered all scaffold routes and the
Settings disclaimer at 390px with no browser console warnings or errors.
