# Build log

Record decisions and outcomes as they are made. Do not include secrets or real
personal data; use synthetic examples only.

## YYYY-MM-DD — Short decision title

- **Context:** What required a decision or verification?
- **Decision:** What was chosen, and why?
- **Alternatives considered:** What meaningful option was declined?
- **Data/safety impact:** What data boundary or product boundary applies?
- **Changed:** Files, migration identifiers, or configuration affected.
- **Verified:** Exact command/check and observed result.
- **Follow-up:** Remaining approval, risk, or next step.

---

## 2026-07-18 — Phase 0 project contract drafted

- **Context:** Establish the project contract before application code.
- **Decision:** Drafted repository conventions, architecture, data handling,
  build-log template, and environment-variable names for approval.
- **Data/safety impact:** First summaries use consented, structured, minimized
  data with relative timing; excluded inputs are not sent to GPT-5.6 by default.
- **Changed:** `AGENTS.md`, `HANDOFF.md`, `docs/architecture.md`,
  `docs/data-handling.md`, `docs/build-log.md`, `.env.example`.
- **Verified:** Repository file inspection; no application source or package
  manifest exists.
- **Follow-up:** User approval before initialization, dependencies, migrations,
  or app code.

---

## 2026-07-18 — Foundation dependencies initialized

- **Context:** Initialize only the approved project foundation before auth,
  migrations, or feature screens.
- **Decision:** Installed pinned Next.js, React, Tailwind, Supabase, form,
  validation, and focused-test dependencies. Added no end-to-end tooling.
- **Data/safety impact:** `.env.local` is gitignored. No Supabase client,
  service-role use, model integration, or user-data route exists yet.
- **Changed:** `package.json`, `package-lock.json`, `.gitignore`, and the
  project-contract documents.
- **Verified:** `npm install` completed with 115 packages installed. The npm
  audit reported two moderate vulnerabilities; no automated remediation was
  applied.
- **Follow-up:** Approve the migration plan. A DOM environment for React
  Testing Library and a lint dependency remain unapproved.

---

## 2026-07-18 — Phase 1 deployable shell scaffolded

- **Context:** Create the approved App Router shell without authentication,
  migrations, or product workflows.
- **Decision:** Added Tailwind/shadcn configuration, explicit Supabase browser
  and server factories, a mobile-first shell, the requested empty routes, and a
  visible Settings product boundary.
- **Data/safety impact:** Browser code reads only public Supabase variables.
  No service-role key, OpenAI key, real data, or data-access feature exists.
- **Changed:** Next/TypeScript/Tailwind configuration, shell components,
  scaffold routes, one utility test, and package lockfile.
- **Verified:** `npm run lint`, `npm run typecheck`, `npm run test`, and
  `npm run build` pass. Local routes rendered with one heading each. Settings
  was checked at 390px with no browser console warnings or errors.
- **Follow-up:** Configure Supabase and implement only approved migrations and
  authentication next. The npm audit reports two moderate findings; no forced
  remediation was applied.

---

## 2026-07-18 — Auth, profile, and access-control scaffolded

- **Context:** Add email/password auth, verification handling, owner-only
  profile/medication access, and medication-aware redirects.
- **Decision:** Added migrations 001_profiles.sql and 002_medications.sql.
  Profiles are created by a signup trigger. Browser and user-facing routes use
  only public Supabase credentials; no service-role client exists.
- **Data/safety impact:** The profile holds only notification preferences and
  timestamps. Medication names remain local data and are never model input.
  Auth responses do not echo account details.
- **Changed:** Auth server actions, callback route, protected-route proxy,
  login/logout UI, validation tests, migrations, and manual verification plan.
- **Verified:** `npm run lint`, `npm run typecheck`, `npm run test`, and
  `npm run build` pass. Live auth/RLS verification remains pending because no
  untracked `.env.local` Supabase configuration is present.
- **Follow-up:** Apply migrations to the configured non-production project and
  execute `docs/manual-auth-rls-test.md` with synthetic User A/User B accounts.

---

## 2026-07-18 — Medication routine setup implemented

- **Context:** Replace unapplied migration 002 with the approved routine schema
  and add the onboarding/manage-routine flow.
- **Decision:** Migration 002 now uses direct `user_id` ownership, an explicit
  routine-only field set, owner-only CRUD RLS, and an index for each user's
  routines. No later migration depended on the replaced schema.
- **Data/safety impact:** Display names are user-provided routine labels, not a
  clinical record. No notes, storage fields, zip codes, or model input were
  added.
- **Changed:** Migration 002, session-derived medication data functions,
  onboarding/list/new/edit/delete routes, validation, focused tests, and the
  manual medication test plan.
- **Verified:** `npm run lint`, `npm run typecheck`, `npm run test`, and
  `npm run build` pass. Live Supabase flow/RLS testing remains pending because
  the untracked `.env.local` configuration is absent.
- **Follow-up:** Apply migrations 001/002 in a non-production project and run
  `docs/manual-medication-test.md` with synthetic accounts.
# 2026-07-18 - Medication Reference scaffold

- **Decision:** Use a dedicated `/medications/[id]/reference` route so routine
  editing stays separate from a consent-gated public-source companion.
- **Decision:** Add `003_medication_references.sql`; do not rewrite prior
  migrations. Future dose/check-in migrations are `004_doses.sql` and
  `005_checkins.sql`.
- **Decision:** DailyMed is the sole implemented adapter. Automatic lookup is
  server-side, requires per-lookup consent, and sends only the routine name and
  selected form/route context. Candidate data is transient.
- **Safety:** A source becomes confirmed only after explicit user confirmation
  and a server-side SET-ID revalidation. No source guide text, packaging image,
  raw query, or raw response is stored.
- **Verification:** `npm run lint`, `npm run typecheck`, `npm run test` (8
  tests), and `npm run build` passed. Live 390px and two-user RLS checks await
  synthetic test users in the configured local Supabase project.
- **Codex acceleration:** Implemented the consent-gated route, DailyMed adapter,
  owner-scoped data access, migration, focused tests, and operational docs in
  one staged slice.
- **Important decision:** Candidate data stays transient; only a
  server-revalidated SET ID confirmed by the person may create stored metadata.
- **Commits:** `e75ad4f` created and pushed to `origin/master` on 2026-07-20.

---

## 2026-07-20 - Dose tracking implemented

- **Decision:** Add `004_doses.sql` with direct `user_id` ownership, controlled
  optional injection sites, and explicit owner-only CRUD RLS. Next routine timing
  is calculated from the latest record and medication interval, not stored.
- **Safety:** Server-side access derives user ownership from the authenticated
  session and rejects injection sites for non-self-injection routines. No notes,
  dosage amounts, clinical details, or instructions were added.
- **Changed:** Dose migration, validation/data-access/actions, `/doses` form and
  history, and dose manual test plan. `005_checkins.sql` remains unimplemented.
- **Verified:** `npm run lint`, `npm run typecheck`, `npm run test` (10 tests),
  and `npm run build` passed. Live Supabase, two-user RLS, and 390px checks are
  pending the local public Supabase configuration.
