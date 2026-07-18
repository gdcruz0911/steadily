# Steadily repository contract

## Scope and product language

Steadily is a personal tracking tool. It does not diagnose, recommend treatment,
estimate disease or flare risk, or replace a clinician. Generated output is
called a **visit discussion summary**, never a clinical report.

## Repository conventions

- Keep changes small and tied to the requested work; do not introduce app code
  before the approved foundation is in place.
- Use the Next.js App Router when implementation begins. Put routes in
  `src/app/`, reusable UI in `src/components/`, server-only integrations in
  `src/lib/server/`, and shared types/validation in `src/lib/`.
- Prefer server-side data access. Never expose service-role credentials or the
  OpenAI API key to browser code.
- Keep secrets out of the repository, build log, fixtures, screenshots, and
  error output. Commit `.env.example`, never a populated `.env` file.
- Use synthetic, clearly labeled data for demos, tests, and screenshots.

## Proposed code style

- TypeScript with strict mode; no `any` without a documented reason.
- React function components, named exports for shared utilities, and
  `async`/`await` for asynchronous work.
- Use clear domain names (`entry`, `symptom`, `summary`) rather than medical
  diagnostic terminology. Keep components focused and accessible.
- Format with Prettier and lint with ESLint after tooling is approved.

## Approved commands (after the project is initialized)

- `npm run dev` — local development only.
- `npm run typecheck` — TypeScript verification.
- `npm run test` — unit/component tests.
- `npm run build` — production build verification.
- `npx supabase db diff` and `npx supabase migration up` — inspect/apply
  reviewed migrations in the intended environment.

Do not run destructive database commands, production migrations, data exports,
or dependency-install commands without explicit approval.

## Testing and definition of done

For each behavior change, add or update the narrowest useful automated test.
Use synthetic data only. Before handoff, run the relevant lint, type, test, or
build command and record the exact verified outcome in `docs/build-log.md`.

A change is done when it:

1. Meets the approved acceptance criteria without expanding the product scope.
2. Preserves the product and data boundaries above.
3. Has appropriate validation and user-facing error handling.
4. Has passing, relevant verification (or a plainly recorded reason it was not
   run).
5. Contains no secrets or real personal data, and updates documentation when
   behavior, data handling, or decisions change.

## Privacy and safety rules

- Treat all user-entered tracking data as personal data; do not describe it as
  anonymous.
- Do not send medication names, zip codes, account identifiers, or free-text
  notes to GPT-5.6 by default.
- Generate a visit discussion summary only after explicit, per-generation user
  consent. Use structured, minimized fields and relative timing. Do not persist
  generated output until the person explicitly chooses Save summary.
- Do not present generated text as medical advice, diagnosis, risk estimation,
  or a substitute for clinical care. Include the agreed boundary in the UI.
- Enforce per-user database access with Supabase Row Level Security before any
  user-data route is released.
