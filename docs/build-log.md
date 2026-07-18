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
