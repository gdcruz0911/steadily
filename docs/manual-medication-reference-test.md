# Manual medication-reference and RLS test

Use two synthetic test users and synthetic routine names only. Do not use real
health information.

## DailyMed consent and confirmation

1. Sign in as User A and create a synthetic routine with a matching dose type.
2. Open `/medications/[id]/reference`. Confirm the default state has no source
   result and presents the exact consent language before lookup.
3. Submit without the consent checkbox. Confirm the visible error appears and
   no request is made to DailyMed.
4. Consent and search. Confirm candidate cards show only title,
   product/formulation, route when available, labeler/manufacturer when
   available, source date, and an official DailyMed link.
5. Confirm that choosing a card alone does not save it. Open its official link,
   then tap “This is my medication.” Refresh and confirm the saved card shows
   the official title, source/retrieved dates, and the appropriate link label.
6. Search with a synthetic name that has no acceptable candidate. Choose “None
   of these are correct.” Confirm the unavailable state and advanced DailyMed
   SET ID/official URL field appear.
7. Enter a non-DailyMed URL. Confirm a visible validation error. Enter a valid
   official DailyMed SET ID or URL, review the resulting card, and confirm that
   no record is saved until “This is my medication” is tapped.

## Two-user RLS verification

1. As User A, confirm an official reference for User A’s synthetic medication.
2. In the app as User B, request User A’s medication reference URL directly.
   Confirm it renders the not-found path and exposes no metadata.
3. With User B’s authenticated browser client or SQL session, attempt `select`,
   `insert`, `update`, and `delete` on `medication_references` using User A’s
   medication ID. Each operation must return no data or an RLS denial.
4. Repeat the same direct operations for User A’s medications, then verify User
   B cannot access User A’s doses, check-ins, or saved summaries when those
   later migrations are applied.
