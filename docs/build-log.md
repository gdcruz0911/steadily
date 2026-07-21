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
- **Commit:** `59b62e4` created and pushed to `origin/master` on 2026-07-20.

---

## 2026-07-21 - Authenticated Data API grants verified

- **Context:** The linked non-production project exposed the existing tables
  through the Data API but lacked authenticated DML table privileges, preventing
  normal user sessions from saving routines and doses.
- **Decision:** Add `005_data_api_grants.sql` without rewriting migrations
  001–004. Revoke all `authenticated` table privileges first, then grant only
  SELECT, INSERT, UPDATE, and DELETE on profiles, medications, medication
  references, and doses. Keep RLS enabled and grant nothing to anon.
- **Data/safety impact:** The browser and verifier use only the public
  Supabase key and normal authenticated sessions. Synthetic records only; no
  credentials, identifiers, or health data were logged.
- **Changed:** `005_data_api_grants.sql`, architecture migration numbering,
  and operational handoff.
- **Verified:** Safe linked dry run planned only 005; remote migration history
  matched 001–005 after apply. Lint, type-check, 10 focused tests, and the
  production build passed. Synthetic User B received 404 for User A’s routine
  and reference and could not see User A’s dose. A one-off public-key,
  authenticated-session insert linked to User A’s medication was denied; User
  A’s dose count was unchanged.
- **Follow-up:** Implement only approved `006_checkins.sql` after this
  checkpoint. The temporary local verifier was removed after the pass.

---

## 2026-07-21 - Structured check-ins deployed

- **Decision:** Add dose-linked 24-hour and 72-hour pending check-ins through
  an `AFTER INSERT` dose trigger, so both rows are created in the same
  transaction as a saved dose. Completion requires six 0–5 scores; skipping is
  explicit. Due and overdue are derived in the UI only.
- **Safety:** Check-ins contain no free text, notes, medication instructions,
  diagnosis, or risk output. Server actions derive ownership from the session.
- **Changed:** `006_checkins.sql`, check-in data access/actions, dashboard due
  banner, check-in UI, Zod validation/tests, and manual verification plan.
- **Verified:** The first remote apply rejected unquoted SQL identifier
  `window` before any schema change. The field name was quoted, a new dry run
  planned only 006, and remote history then matched 001–006. `npm run lint`,
  `npm run typecheck`, `npm run test` (13 tests), and `npm run build` passed.
- **Follow-up:** Complete the synthetic 390px and two-user manual check-in
  plan; no live browser session was available during this slice.

---

## 2026-07-21 - Check-ins Data API grants corrected

- **Context:** Read-only remote inspection found default anon table grants on
  newly created check-ins, despite RLS being enabled.
- **Decision:** Add `007_checkins_data_api_grants.sql` rather than rewriting
  applied migration 006. Revoke all anon and authenticated privileges, then
  grant only authenticated SELECT, INSERT, UPDATE, and DELETE.
- **Verified:** Safe dry run planned only 007; remote history matched 001–007
  after apply. Read-only remote schema verification found RLS enabled, four
  owner policies, zero anon grants, and exactly authenticated DML grants.
- **Follow-up:** Keep the explicit grant model for each later Data API table.

---

## 2026-07-21 - Synthetic check-in manual verification

- **Context:** Execute `docs/manual-checkin-test.md` with the existing
  synthetic User A/User B accounts after migrations 006 and 007 were deployed.
- **Verified:** A synthetic backdated User A dose created exactly one due 24h
  and one due 72h check-in, with a dashboard count of two. Completion rejected
  omitted scores with visible field errors and accepted all six 0–5 scores.
  Explicit skipping removed the remaining due check-in and left it `skipped` in
  history. At the 390px viewport override, labels remained above controls and
  page content had no horizontal overflow. User B’s dashboard and check-in
  history contained none of User A’s synthetic records.
- **Observed:** The history displays the 24-hour scheduled timestamp as “Dose
  recorded” for a completed/skipped pair instead of the original administration
  timestamp. Grouping and statuses were otherwise correct. No application code
  was changed in this manual-verification checkpoint.
- **Not rerun:** Direct authenticated Data API SELECT/INSERT/UPDATE/DELETE
  attempts against User A’s check-ins. Remote RLS/policy/grant inspection and
  in-app User B isolation remain the available evidence.
- **Data/safety impact:** Only synthetic account and tracking data were used;
  test sessions were signed out. No credentials, identifiers, or health details
  were recorded.

---

## 2026-07-21 - Check-in history recorded-time correction

- **Context:** Manual synthetic-account testing showed the history could label
  a check-in’s scheduled time as “Dose recorded.”
- **Decision:** Normalize the dose and medication relation as either the
  singular or array response shape before mapping history. Use
  `doses.administered_at` for Dose recorded; keep `checkins.scheduled_at`
  explicitly labeled Scheduled.
- **Data/safety impact:** No data collection, schema, RLS, external request,
  or user flow changed. Verification used existing synthetic records only.
- **Changed:** `src/db/checkins.ts` and its focused mapping regression test.
- **Verified:** At 390px, User A history displayed Jul 18 and Jul 17 as Dose
  recorded, and the 24h/72h values as Scheduled, with no horizontal overflow.
  `npm run lint`, `npm run typecheck`, `npm run test` (7 files, 14 tests), and
  `npm run build` passed.
- **Follow-up:** Rerun the documented direct normal-session two-user check-in
  RLS test in a future security pass.

---

## 2026-07-21 - Direct check-in RLS DML verification

- **Context:** Close the remaining direct two-user check-in authorization
  proof using the existing synthetic accounts and a one-off public-client
  verifier.
- **Verified:** User B could not SELECT, UPDATE, or DELETE User A’s check-in;
  each request returned no target rows. User B’s INSERT referencing User A’s
  dose was denied by RLS. User A’s check-in records remained unchanged after
  all attempts.
- **Data/safety impact:** The verifier used only the public Supabase key and
  normal authenticated sessions. Credentials and identifiers were hidden at
  entry, never stored, and never logged. Only synthetic records were used.
- **Changed:** Removed the one-off local verifier after the pass and recorded
  the verification evidence in the public data-handling documentation.

---

## 2026-07-21 - Public README documented

- **Context:** Add a repository-accurate public entry point without introducing
  deployment infrastructure, a license, or product scope.
- **Changed:** Added `README.md` with current features, local setup, localhost
  Supabase Auth redirects, safe non-production migration steps, verification
  commands, product/privacy boundaries, curated Updates limitations, and the
  verified two-user RLS model.
- **Verified:** No Markdown linter or link-checker is configured. A local
  structural check confirmed the required README sections and that all six
  Updates links match the version-controlled curated source URLs.

---

## 2026-07-21 - Authenticated UI clarity pass

- **Context:** Refine the existing mobile-first authenticated experience
  without changing data, navigation destinations, or product scope.
- **Changed:** Added active navigation, shared factual status badges, stronger
  focus/wrap/reduced-motion styles, consistent form and empty/error/loading
  states, and responsive card grouping across the Medication Hub, medication
  routine detail, doses, check-ins, Visit Prep, and Updates.
- **Verified:** `npm run lint`, `npm run typecheck`, `npm run test` (12 files,
  22 tests), and `npm run build` passed. The isolated local shell had no
  horizontal overflow at 390px, 768px, or 1280px; the 390px check found a 44px
  minimum interactive height. The authenticated browser session itself was not
  available to the isolated audit tab.
- **Data/safety impact:** No schema, RLS, external request, user data handling,
  or clinical language changed.
