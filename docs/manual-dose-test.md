# Manual dose and RLS test

Use synthetic medication routine names and synthetic User A/User B accounts
only. Do not use real health information.

## Dose flow

1. Sign in as User A and create one synthetic self-injection routine and one
   synthetic non-injection routine.
2. Open `/doses` at a 390px viewport. Confirm labels, touch targets, and the
   date/time control remain usable without horizontal scrolling.
3. Select the self-injection routine. Confirm the date/time defaults locally,
   remains editable, and the optional controlled injection-site control appears.
4. Record two synthetic doses with different injection sites. Confirm history is
   reverse chronological and the form suggests avoiding those two sites while
   allowing any valid site.
5. Confirm routine timing is calculated from the latest record plus the saved
   interval and is not a persisted database field.
6. Select the non-injection routine. Confirm no injection-site control appears.
7. Submit a malformed date, invalid medication ID, or invalid site through a
   tampered request. Confirm server-side validation rejects it.

## Two-user RLS verification

1. As User A, create a synthetic dose for User A's medication.
2. As User B, request User A's `/doses` data through the app and direct
   Supabase queries. Confirm User B cannot select, insert, update, or delete
   User A's dose or insert against User A's medication ID.
3. As User A, confirm User A can create, read, update, and delete only User A's
   own synthetic dose records.
