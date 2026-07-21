# Architecture - Phase 0 contract

## MVP user flow

1. A person creates an email/password account and verifies their email address.
2. They add medications and the doses associated with each medication.
3. They record structured check-ins for doses and review their own timeline.
4. They choose a relative date window, preview the minimized structured data, and
   explicitly consent to generate a visit discussion summary.
5. The server generates and renders the summary. It is saved only after the
   person selects Save summary.

Steadily is a personal tracking tool. It does not diagnose, recommend
treatment, estimate disease or flare risk, or replace a clinician. Generated
output is called a visit discussion summary, never a clinical report.

## Approved foundation

- **Next.js 16.2.10:** exact stable patch installed with React 19.2.7.
- **TypeScript:** strict mode will be enabled during project configuration.
- **Tailwind CSS and shadcn/ui:** Tailwind provides styling; shadcn/ui provides
  locally owned, accessible primitives. No UI primitive has been added yet.
- **Supabase:** email/password authentication with email verification, Postgres,
  and Row Level Security.
- **Forms:** Zod schemas shared by server and client, with React Hook Form.
- **Testing:** Vitest and React Testing Library for focused validation/UI tests.
  No end-to-end tooling is in scope before the MVP is complete.
- **Motion:** no animation dependency. Use brief CSS feedback only and honor
  reduced-motion preferences.

## Approved UI system

**Design read:** a mobile personal-tracking product for clinician-visit
preparation, using a calm healthcare-service visual language.

| Token | Value |
| --- | --- |
| Background | #F4F8F8 |
| Surface | #FFFFFF |
| Primary text | #172321 |
| Secondary text | #52615F |
| Accent / primary action | #0F5F59 |
| Accent hover | #0A4844 |
| Focus ring | #0F766E |
| Error | #B42318 |
| Success | #176B4D |
| Radius | 12px |
| Spacing | 4, 8, 12, 16, 24, 32, 48px |
| Control size | 44px minimum; 48px primary action |

The MVP is light-only. It is mobile-first and must be checked at 390px. Use
labels above inputs, clear focus states, WCAG AA contrast, text/icon labels in
addition to color, one primary action per screen, and plain reassuring language.
Avoid dashboard-card clutter, gamification, excessive charts, and unsupported
clinical claims.

## Route map

| Route | Purpose | Access |
| --- | --- | --- |
| / | Product boundary and sign-in entry | Public |
| /login | Email/password authentication | Public |
| /onboarding | Account setup after authentication | Authenticated owner |
| /dashboard | Personal tracking overview | Authenticated owner |
| /doses | Dose tracking | Authenticated owner |
| /checkins | Structured check-ins | Authenticated owner |
| /report | Summary preview, consent, generation, and explicit saving | Authenticated owner |
| /settings | Data deletion controls and retention explanation | Authenticated owner |
| /medications/[id] | Edit a personal medication routine | Authenticated owner |
| /medications/[id]/reference | Consent-gated official-source companion | Authenticated owner |

## Component boundaries

- **Route shells:** authentication gate, light app layout, loading, and errors.
- **Tracking:** MedicationForm, DoseForm, CheckinForm, and CheckinTimeline;
  all work with structured data.
- **Summary:** SummaryWindowForm, DataPreview, ConsentDialog, and
  VisitDiscussionSummary. The save control is separate from generation.
- **Server/domain:** authenticated Supabase access, Zod validation, payload
  minimization, GPT-5.6 call, and optional saved-summary persistence.
- **Safety copy:** shared product-boundary and consent language.
- **Official references:** a server-only source-adapter interface; DailyMed is
  the first adapter. Searches are consent-gated, candidates are transient, and
  a SET ID is revalidated server-side before a person can confirm a reference.

## First migration plan - not implemented

1. 001_profiles.sql: create profiles keyed to auth.users.id, with notification
   preferences plus created/updated timestamps and owner-only read/update RLS.
2. 002_medications.sql: create personal medication routines with user_id,
   display name, label, routine cadence, optional loading phase, and timestamps.
   Add the owner index and explicit owner-only CRUD RLS. Display names are never
   model input by default.
3. 003_medication_references.sql: create one optional official-source reference
   per medication routine, with source metadata, confirmation status, and
   RLS through the medication owner. Candidate responses are never stored.
4. 004_doses.sql: create user-owned, medication-linked dose records with an
   administered timestamp, optional controlled injection site, timestamps, and
   explicit owner-only CRUD RLS. Calculate routine timing from the latest dose
   plus the medication interval; do not store a next-dose timestamp.
5. 005_data_api_grants.sql: revoke existing authenticated table privileges, then
   grant only SELECT, INSERT, UPDATE, and DELETE on profiles, medications,
   medication references, and doses. RLS remains enabled; anon receives nothing.
6. 006_checkins.sql: after doses are verified, create user-owned, dose-linked
   24-hour and 72-hour controlled check-ins. A dose creates pending rows
   transactionally; due and overdue state are derived, not stored.
7. 007_visit_discussion_summaries.sql: create optional user-saved summaries
   with profile_id, selected-window metadata, generated text, model ID, and
   payload version. Generation alone does not create a row.
8. 008_rls_policies.sql: enable RLS, add explicit per-operation policies with
   comments for every user-owned table, and add ownership/date indexes.
9. 009_deletion_support.sql: implement reviewed deletion support only after the
   retention policy and backup window are approved.

A separate summary_generation_events table is not planned. Add one only if a
documented compliance need requires a consent audit. It must contain only user
ID, timestamp, policy/payload version, and outcome, never model input, output,
or health details.

~~~mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : has
  PROFILES ||--o{ MEDICATIONS : owns
  MEDICATIONS ||--o{ DOSES : contains
  MEDICATIONS ||--o| MEDICATION_REFERENCES : has
  DOSES ||--o{ CHECKINS : contains
  PROFILES ||--o{ VISIT_DISCUSSION_SUMMARIES : owns

  AUTH_USERS {
    uuid id PK
  }
  PROFILES {
    uuid id PK_FK
    jsonb notification_preferences
    timestamptz created_at
    timestamptz updated_at
  }
  MEDICATIONS {
    uuid id PK
    uuid user_id FK
    text display_name
    text color_label
    text dose_type
    int interval_days
    bool has_loading_phase
    int loading_dose_count
    int loading_interval_days
    timestamptz created_at
    timestamptz updated_at
  }
  DOSES {
    uuid id PK
    uuid user_id FK
    uuid medication_id FK
    timestamptz administered_at
    text injection_site
    timestamptz created_at
    timestamptz updated_at
  }
  MEDICATION_REFERENCES {
    uuid id PK
    uuid medication_id FK
    text source_provider
    text source_identifier
    text source_url
    text official_title
    text confirmed_product_name
    text formulation_or_route
    date source_revision_date
    timestamptz retrieved_at
    timestamptz user_confirmed_at
    text status
  }
  CHECKINS {
    uuid id PK
    uuid dose_id FK
    text status
    timestamptz checked_at
    timestamptz created_at
  }
  VISIT_DISCUSSION_SUMMARIES {
    uuid id PK
    uuid profile_id FK
    date window_start
    date window_end
    text summary_text
    text model_id
    text payload_version
    timestamptz created_at
  }
~~~
