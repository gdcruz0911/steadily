# Steadily

Steadily is a private, personal tracking tool for recording medication routines,
doses, and structured follow-up check-ins. It helps a person assemble a factual
record for a clinician visit discussion; it does not diagnose, recommend
treatment, estimate disease or flare risk, or replace a clinician.

## Current features

- Email/password sign-up, email verification, sign-in, sign-out, and protected
  routes.
- Personal medication routines with a user-provided display name, dose type,
  interval, and optional loading-phase fields.
- A consent-gated DailyMed official-reference companion. A person reviews and
  confirms a candidate before Steadily stores the reference metadata and link.
- Dose recording with an editable administration time and a controlled
  injection-site choice for self-injection routines.
- Automatic pending 24-hour and 72-hour structured check-ins for every saved
  dose. A check-in can be completed with all six 0–5 scores or explicitly
  skipped; there are no free-text symptom fields.
- A Medication Hub showing factual routine, latest-dose, pending-check-in, and
  official-reference status.
- Visit Prep: a factual 7-day or 30-day view of existing records with a
  browser-local “Copy for my visit” action.
- A protected, fixed psoriasis Research & Updates pilot with curated public
  source links.

## Technology

- Next.js App Router, React, and TypeScript (strict mode)
- Tailwind CSS with locally owned shadcn/ui primitives
- Supabase Auth, Postgres, Row Level Security, and the authenticated Data API
- Zod and React Hook Form for validation and forms
- Vitest and React Testing Library for focused tests

## Local setup

### Prerequisites

- A current Node.js LTS release compatible with Next.js 16 and npm
- A Supabase project for local, non-production development
- The Supabase CLI only when inspecting or applying migrations

Install the pinned repository dependencies, then create an untracked
`.env.local` file in the repository root with the public variables required by
the current app:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Do not commit `.env.local`. Browser and user-facing routes use only these public
Supabase values; no service-role key is used in the app’s browser code or
user-facing auth/data routes.

Start the app:

```bash
npm run dev
```

### Supabase Auth for localhost

In the Supabase Dashboard’s Auth URL configuration for the local project:

1. Set **Site URL** to `http://localhost:3000`.
2. Add `http://localhost:3000/auth/confirm` to **Redirect URLs**.
3. Use the email/password flow with email verification enabled.

The app’s confirmation route exchanges the verification code and redirects to
the authenticated dashboard.

## Safe migration workflow

Migrations are reviewed SQL files in `supabase/migrations/`. Apply them only to
the intended non-production project and only after approval. Never rewrite a
migration that has been applied to a shared environment.

```bash
npx supabase login
npx supabase link --project-ref <non-production-project-ref>
npx supabase migration list --linked
npx supabase db push --dry-run
npx supabase db push
npx supabase migration list --linked
```

Before the actual push, confirm that the linked migration history and dry-run
show no filename or history conflict. Afterward, inspect the linked list again
and run the relevant synthetic two-user authorization checks. Never put a
database password, access token, or service-role key in this repository.

## Verification commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Use synthetic data only for tests, demos, screenshots, and manual verification.
The interface is mobile-first and key flows are checked at a 390px viewport.

## Product and privacy boundaries

- Steadily is not a clinical tool and does not provide diagnosis, treatment
  recommendations, disease or flare-risk estimates, or urgent-care guidance.
- Personal tracking data is not described as anonymous.
- Medication routines are personal labels, not clinical medication records.
- The MVP excludes zip codes, free-text notes, storage instructions, dosage
  amounts, clinical drug details, and medication instructions.
- The DailyMed lookup is consent-gated. It sends only the routine name and
  selected form/route context needed to search public official information; it
  does not send identity, profile, dose-history, check-in, symptom, or note
  data. Candidate results are transient.
- Visit Prep does not store copied text or send it to an external service.

## Psoriasis Research & Updates pilot

Updates is a fixed, non-personalized psoriasis pilot. It stores no condition on
the user profile, does not fetch at runtime, and does not rank, interpret, or
recommend information for an individual. Each local entry is version-controlled
and links to its public source:

- [ClinicalTrials.gov: ONWARD3 study record](https://clinicaltrials.gov/study/NCT06846541)
- [PubMed: ESK-001 phase 2 study report](https://pubmed.ncbi.nlm.nih.gov/40659116/)
- [PubMed: LITE randomized clinical trial report](https://pubmed.ncbi.nlm.nih.gov/39319513/)
- [FDA: interchangeable biosimilar announcement](https://www.fda.gov/news-events/press-announcements/fda-approves-interchangeable-biosimilar-multiple-inflammatory-diseases)
- [FDA: 2023 novel-drug approvals](https://www.fda.gov/drugs/novel-drug-approvals-fda/novel-drug-approvals-2023)
- [NIH/NIAMS: psoriasis overview and research resources](https://www.niams.nih.gov/health-topics/psoriasis)

Source links are provided for direct reading. They are not personalized advice,
outcome predictions, or claims of a breakthrough.

## Access control and verified RLS model

All personal records use Supabase Row Level Security. `profiles`,
`medications`, `doses`, and `checkins` enforce direct authenticated ownership;
`medication_references` enforce ownership through the linked medication.

The Data API model is explicit: `authenticated` has only the required
SELECT/INSERT/UPDATE/DELETE table privileges, while `anon` has no table
privileges for these records. RLS still determines which rows an authenticated
person can access.

Using two synthetic normal authenticated public-client sessions, direct checks
confirmed that User B could not select, insert, update, or delete User A’s
check-ins, including an insert linked to User A’s dose. User A’s records were
unchanged after the denied attempts. No service-role key or stored credentials
were used for that verification.
