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
| /sign-in | Email/password authentication | Public |
| /track | Medications, doses, and check-in timeline | Authenticated owner |
| /medications/[id] | Review/edit one medication and its doses | Authenticated owner |
| /summary/new | Window selection, data preview, consent, generation | Authenticated owner |
| /summaries/[id] | View one explicitly saved visit discussion summary | Authenticated owner |
| /settings/data | Data deletion controls and retention explanation | Authenticated owner |

## Component boundaries

- **Route shells:** authentication gate, light app layout, loading, and errors.
- **Tracking:** MedicationForm, DoseForm, CheckinForm, and CheckinTimeline;
  all work with structured data.
- **Summary:** SummaryWindowForm, DataPreview, ConsentDialog, and
  VisitDiscussionSummary. The save control is separate from generation.
- **Server/domain:** authenticated Supabase access, Zod validation, payload
  minimization, GPT-5.6 call, and optional saved-summary persistence.
- **Safety copy:** shared product-boundary and consent language.

## First migration plan - not implemented

1. 001_profiles.sql: create profiles keyed to auth.users.id, with timezone and
   consent-policy version.
2. 002_medications.sql: create medications with profile_id, name, and
   timestamps. Medication names are never model input by default.
3. 003_doses.sql: create doses owned through their medication, with a scheduled
   timestamp and timestamps.
4. 004_checkins.sql: create checkins owned through their dose, with structured
   status and recorded timestamp.
5. 005_visit_discussion_summaries.sql: create optional user-saved summaries
   with profile_id, selected-window metadata, generated text, model ID, and
   payload version. Generation alone does not create a row.
6. 006_rls_policies.sql: enable RLS, add explicit per-operation policies with
   comments for every user-owned table, and add ownership/date indexes.
7. 007_deletion_support.sql: implement reviewed deletion support only after the
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
  DOSES ||--o{ CHECKINS : contains
  PROFILES ||--o{ VISIT_DISCUSSION_SUMMARIES : owns

  AUTH_USERS {
    uuid id PK
  }
  PROFILES {
    uuid id PK_FK
    text timezone
    text consent_policy_version
  }
  MEDICATIONS {
    uuid id PK
    uuid profile_id FK
    text name
    timestamptz created_at
  }
  DOSES {
    uuid id PK
    uuid medication_id FK
    timestamptz scheduled_for
    timestamptz created_at
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
