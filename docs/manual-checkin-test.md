# Manual check-in and RLS test

Use synthetic User A/User B accounts and synthetic routine names only. Do not
use real health information.

## Check-in flow

1. Sign in as User A and record a synthetic dose dated at least 72 hours ago.
2. Confirm the dose creates exactly one pending 24-hour and one pending 72-hour
   check-in, both visible as due on `/checkins` and in the dashboard banner.
3. At a 390px viewport, confirm each score has a visible label above its
   control, an error is shown for an omitted score, and the form has no
   horizontal scrolling.
4. Complete one check-in with all six scores in the 0–5 range. Confirm it shows
   `completed` with a completion time in the history grouped under that dose.
5. Explicitly skip the other. Confirm it shows `skipped`, has no scores, and is
   removed from the due list.
6. Submit an invalid score or tampered check-in ID. Confirm server validation
   rejects it and no check-in is changed.

## Two-user RLS verification

1. As User A, retain the two generated check-in IDs and the linked synthetic
   dose ID.
2. As User B, use a normal authenticated public-key session to attempt SELECT,
   INSERT, UPDATE, and DELETE against User A's check-ins and a check-in linked
   to User A's dose. Confirm each operation is denied or returns no rows.
3. As User A, confirm both User A rows retain their original status and scores.
