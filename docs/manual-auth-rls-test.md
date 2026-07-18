# Manual authentication and RLS test

Run this plan only with synthetic test accounts and a configured local Supabase
project. Do not use real health or medication data.

## Setup

1. Apply migrations 001_profiles.sql and 002_medications.sql to the intended
   non-production Supabase project.
2. Set the Site URL to http://localhost:3000.
3. Add http://localhost:3000/auth/confirm to Supabase Auth Redirect URLs.
4. Configure only NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in
   the untracked .env.local file.
5. Create two synthetic test accounts: User A and User B.

## Authentication and routing

1. Visit /dashboard while signed out. Expected: redirect to /login.
2. Sign up User A with a synthetic email and password. Expected: generic
   verification message with no email value echoed by the app.
3. Open the verification link. Expected: /auth/confirm exchanges the code and
   redirects to /dashboard, then the route guard redirects User A to
   /onboarding because User A has no medication.
4. Sign out from Settings. Expected: redirect to /login?message=signed-out.
5. Sign in as User A. Expected: redirect through /dashboard to /onboarding.
6. Insert one synthetic medication routine for User A through an authenticated
   direct Supabase query. Expected: a new visit to /onboarding redirects to
   /dashboard.
7. Visit each protected route while signed out: /onboarding, /dashboard, /doses,
   /checkins, /report, and /settings. Expected: each redirects to /login.

## Cross-user RLS denial

Execute each query while authenticated as User B and using User A record IDs.

| Table | Operation | Expected result |
| --- | --- | --- |
| profiles | select User A profile | no rows |
| profiles | update User A preferences | zero rows updated |
| medications | select User A medication | no rows |
| medications | insert with User A user_id | RLS rejection |
| medications | update User A medication | zero rows updated |
| medications | delete User A medication | zero rows deleted |

Record only pass/fail outcomes in the project handoff or build log. Do not copy
emails, tokens, medication names, or other personal data into documentation.
