# Data handling - Phase 0 contract

## Product boundary

Steadily is a personal tracking tool. It does not diagnose, recommend
treatment, estimate disease or flare risk, or replace a clinician. Generated
output is a **visit discussion summary**, not a clinical report.

## Exact MVP data fields

| Area | Fields | Stored in Supabase | Sent to GPT-5.6 by default |
| --- | --- | --- | --- |
| Account/profile | Supabase auth user ID, email (Auth only), email-verification state (Auth only), timezone, consent-policy version | Yes | No |
| Medication | medication name, profile ID, created timestamp | Yes | No |
| Dose | medication ID, scheduled timestamp, created timestamp | Yes | Relative timing only |
| Check-in | dose ID, status, checked timestamp, created timestamp | Yes | Relative timing and structured status only |
| Saved summary | selected relative window, summary text, model ID, payload version, created timestamp | Only after explicit Save summary action | Generation response only |
| Excluded inputs | medication names, zip codes, account identifiers, free-text notes | Not collected in the MVP, except medication name as local Supabase data | No |

Check-in status is a controlled enum, not free text. The first summary version
contains no free-text notes.

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
