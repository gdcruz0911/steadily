# Data handling - Phase 0 contract

## Product boundary

Steadily is a personal tracking tool. It does not diagnose, recommend
treatment, estimate disease or flare risk, or replace a clinician. Generated
output is a **visit discussion summary**, not a clinical report.

## Exact MVP data fields

| Area | Fields | Stored in Supabase | Sent to GPT-5.6 by default |
| --- | --- | --- | --- |
| Account/profile | Supabase auth user ID, email (Auth only), email-verification state (Auth only), notification preferences, created/updated timestamps | Yes | No |
| Medication routine | user ID, display name, color label, dose type, interval, optional loading-phase values, created/updated timestamps | Yes | No |
| Official medication reference | medication ID, DailyMed provider, SET ID, official URL, title, confirmed product/form or route, source date, retrieved/confirmed timestamps, status | Only after explicit confirmation or an unavailable choice | No |
| Dose | user ID, medication ID, administered timestamp, optional controlled injection site, created/updated timestamps | Yes | Relative timing only |
| Check-in | user ID, dose ID, 24h/72h window, scheduled/completed timestamps, pending/completed/skipped status, six nullable 0–5 structured scores, created/updated timestamps | Yes | Relative timing, controlled status, and structured scores only |
| Visit prep | A browser-rendered factual selection of the person’s existing medication, dose, and check-in records for a 7-day or 30-day window | No new data; reads existing owner-scoped records only | No |
| Research & updates | Fixed local psoriasis pilot metadata: source organization, date label, category, short neutral description, and public source URL | No database storage or user-profile condition | No |
| Saved summary | selected relative window, summary text, model ID, payload version, created timestamp | Only after explicit Save summary action | Generation response only |
| Excluded inputs | zip codes, account identifiers, storage notes, free-text clinical fields | Not collected in the MVP | No |

Check-in status is a controlled enum, not free text. The first summary version
contains no free-text notes.

Check-ins are created as pending 24-hour and 72-hour rows in the same database
transaction as a saved dose. A check-in can be completed only with all six
structured scores, or explicitly skipped. Due and overdue presentation is
derived from `scheduled_at`; it is never stored as a health or risk state.

Check-ins are available through the Data API only to authenticated sessions
with SELECT, INSERT, UPDATE, and DELETE privileges. Anonymous sessions receive
no table privilege, and the four explicit owner-only RLS policies are still
required for every row operation.

The deployed non-production project has been verified with two synthetic,
normal authenticated public-client sessions: User B could not select, insert,
update, or delete User A’s check-ins, including an insert linked to User A’s
dose. User A’s records were unchanged after those attempts. This verification
used no service-role key and retained no test credentials.

Dose records contain no dosage amount, instructions, clinical drug details, or
free text. A calculated routine date is derived from the latest recorded dose
and the saved medication interval; it is never stored as a dose field.

## GPT-5.6 payload rule

Only after consent, the server sends a minimized structured payload: relative
timing within the selected window and check-in status. It does not send calendar
dates, medication names, zip codes, account identifiers, email, Supabase IDs,
or free-text notes. The server uses the OpenAI API key; the browser never
receives it.

Generated output is rendered for the person but is not persisted by default.
Saving it requires a separate explicit Save summary action.

## Visit Prep

Visit Prep is a factual, read-only view of the authenticated person’s existing
medication routines, doses, and check-ins. A person may choose a 7-day or
30-day window. Doses are included by administration time; check-ins are included
by scheduled time. The page shows recorded check-in scores only when they are
present.

“Copy for my visit” creates plain text in the person’s local browser clipboard.
Steadily does not store that text, send it to an LLM or external API, run
background processing, or treat it as a generated visit discussion summary.
The page states that it is a personal record for discussion with a clinician,
not medical advice.

## Medication Hub

Medication Hub reads existing owner-scoped medication routines, recorded doses,
pending check-ins, and official-reference metadata to present concise dashboard
cards. It does not create a table, persist a dashboard summary, send data to an
external service, or store a profile condition. Counts reflect only the stored
`pending` check-in status; the Hub does not infer missed doses, calculate
adherence, score symptoms, or provide clinical recommendations.

## Research & Updates pilot

The protected Research & Updates page is a fixed local pilot with psoriasis as
its single topic. It contains six version-controlled items from FDA, NIH/NIAMS,
ClinicalTrials.gov, and PubMed-indexed peer-reviewed journal records. Each item
includes source organization, a publication or update date label, category, a
brief neutral description, and an external link.

The pilot does not read or store a person’s condition, medication, tracking
history, profile data, or identifiers. It has no LLM, RAG, external runtime
fetch, background job, personalized ranking, notification, or database table.
It does not provide medication advice, outcome predictions, or clinical
interpretation. The static entries may be revised only through a reviewed code
change with source verification.

## Consent language

> I agree to send the structured tracking data previewed here, using relative
> timing, to GPT-5.6 to create a visit discussion summary. This tool does not
> diagnose conditions, recommend treatment, estimate disease or flare risk, or
> replace a clinician. Medication names, zip codes, account identifiers, and
> free-text notes are not included.

Consent is explicit, unselected by default, and required for each generation.
A consent event is not stored unless a documented compliance need requires it.
If added, it stores only user ID, timestamp, policy/payload version, and
outcome, never raw model input/output or health details.

## Retention and deletion approach

- Supabase retains account, medication, dose, check-in, and explicitly saved
  summary data until the person deletes it or requests account deletion, subject
  to an approved and disclosed operational backup window.
- The product will provide deletion for each user-owned record and account-data
  deletion. Account deletion removes application-table records and requests
  deletion of the associated Auth account through a server-side workflow.
- Backups, logs, and provider retention are not described as anonymous or
  instantly erasable. Actual retention periods must be approved before release.
- Do not log raw tracking data, model payloads, generated summaries,
  authorization headers, or secrets. Operational logs use request IDs and
  non-sensitive error classes.

## Consented official-source lookup

The Medication Reference feature uses a server-only DailyMed adapter. It does
not use GPT-5.6 and does not send a person’s Supabase ID, name, email, dose
history, check-ins, symptoms, notes, profile data, or authentication data to
DailyMed.

Before an automatic lookup, the person must explicitly agree to this language:

> To locate public official medication information, Steadily will send the
> medicine name and selected form/route to DailyMed. We do not send your name,
> dose history, symptoms, notes, or profile information.

After consent, the server calls DailyMed’s public `spls` search endpoint with
the routine name. The selected form or route is used only to narrow the
candidate list because DailyMed’s documented search endpoint does not expose a
form or route query parameter. The browser receives only the candidate fields
needed for review: title, product/formulation, route when available, labeler or
manufacturer when available, source date, SET ID, and official link.

The candidate list is transient. Steadily does not store raw search queries,
search responses, source-guide bodies, packaging images, or any record of the
lookup itself. A candidate becomes a stored reference only after the person
reviews the official link and taps “This is my medication.” The server then
uses the SET ID to retrieve and revalidate the official record before storing
only the confirmed metadata used by the reference card. If no candidate is
correct, the person can mark the reference unavailable; that status stores no
source metadata. An advanced path accepts only a DailyMed SET ID or an official
DailyMed URL and still requires the same explicit confirmation after review.

The adapter interface permits future official sources such as FDA or FDALabel,
but no other source is enabled in this release. It makes HTTPS GET requests
only, never uploads data, never accesses packaging images, and never derives a
match from an image or a routine name alone.

## Demo and test data

All demos, fixtures, screenshots, automated tests, and example summaries use
synthetic data. Never use real personal tracking data for these purposes.

## Environment variables

~~~dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=
~~~

SUPABASE_SERVICE_ROLE_KEY and OPENAI_API_KEY are server-only. .env.local is
gitignored. The service-role key must never use a NEXT_PUBLIC_ prefix or be
imported by client code.
