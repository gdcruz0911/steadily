# Steadily

Steadily is a personal tracking tool for organizing medication routines, recorded doses, and structured follow-up check-ins. It helps people prepare a factual record for a clinician visit discussion; it does not diagnose, recommend treatment, estimate disease or flare risk, or replace a clinician.

## Current features

- Email/password authentication with email verification and protected routes
- Personal medication routines and a consent-gated official-information reference companion
- Dose recording, including controlled injection-site choices for self-injection routines
- Automatic 24-hour and 72-hour structured check-ins, with completion or explicit skipping
- A factual Medication Hub for recent doses, pending check-ins, and official-reference status
- Visit Prep with a 7-day or 30-day personal record and browser-local copy action
- A fixed, source-linked psoriasis Research & Updates pilot

## Technology stack

- Next.js App Router, React, and strict TypeScript
- Tailwind CSS and locally owned shadcn/ui primitives
- Supabase Auth, Postgres, and Row Level Security
- Zod and React Hook Form
- Vitest and React Testing Library

## Product and privacy boundaries

- Steadily is not a clinical tool and provides no diagnosis, treatment recommendation, risk estimate, or urgent-care guidance.
- Personal tracking data is not described as anonymous.
- Medication routines are personal labels, not clinical medication records.
- The app does not collect zip codes, free-text notes, storage instructions, dosage amounts, clinical drug details, or medication instructions.
- Official-information lookup requires consent and limits the public-source search to the routine name and selected form or route; candidate results are transient.
- Visit Prep does not store copied text or send it to an external service.
- Research & Updates is fixed and non-personalized: it does not store a person’s condition, fetch at runtime, or provide individual advice, predictions, or interpretation.
