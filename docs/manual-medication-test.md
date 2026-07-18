# Manual medication routine test

Run this plan only after applying migrations 001_profiles.sql and
002_medications.sql to a non-production Supabase project. Use synthetic test
accounts and synthetic routine names only.

## Routine flow at 390px

1. Set the browser viewport to 390px wide and sign in as a new synthetic user.
2. Visit /onboarding. Expected: all labels, controls, and the primary Continue
   action are visible and touch targets are at least 44px high.
3. Create a routine with a display name, a color label, dose type, and interval.
   Expected: redirect to /dashboard.
4. Visit /medications. Expected: the new routine is visible.
5. Open the routine, change its color or interval, and save. Expected: the list
   reflects the change.
6. Delete the routine. Expected: the list shows no routines and a visit to a
   protected route redirects to /onboarding.

## Validation

1. Submit an empty display name. Expected: visible inline error.
2. Submit an interval of zero. Expected: visible inline error.
3. Enable the loading phase without its count or interval. Expected: visible
   inline error for the missing value.

## Owner-only RLS

Create one synthetic routine as User A. Authenticate as User B and attempt the
following against that routine ID. Expected results:

| Operation | Expected result |
| --- | --- |
| Select | no rows |
| Insert with User A user_id | RLS rejection |
| Update | zero rows updated |
| Delete | zero rows deleted |

Record pass/fail only. Do not include account details, tokens, or routine names
in logs or committed documentation.
