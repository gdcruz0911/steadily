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
| Check-in | dose ID, status, checked timestamp, created timestamp | Yes | Relative timing and structured status only |
| Saved summary | selected relative window, summary text, model ID, payload version, created timestamp | Only after explicit Save summary action | Generation response only |
| Excluded inputs | zip codes, account identifiers, storage notes, free-text clinical fields | Not collected in the MVP | No |

Check-in status is a controlled enum, not free text. The first summary version
contains no free-text notes.

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
