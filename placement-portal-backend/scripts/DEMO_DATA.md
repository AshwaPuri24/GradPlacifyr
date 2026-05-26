# Demo Data — Placement Portal

Two standalone Node scripts live in this folder for populating and wiping a
realistic, Indian-context placement dataset so the portal can be demoed end-
to-end without any real users.

**No application code is modified by either script.** They only read/write
through the existing Prisma client and can be removed entirely (along with
this README) after the demo.

## Files

| File | Purpose |
|------|---------|
| `seed-demo.js`  | Inserts demo users, profiles, jobs, rounds, applications and events |
| `clear-demo.js` | Deletes everything created by `seed-demo.js`, leaving real data untouched |
| `DEMO_DATA.md`  | This file |

## How the data is tagged

Every demo account uses the email domain **`@demo.placement.local`**. That is
the single marker the cleanup script looks for, so nothing real ever gets
deleted.

## Running

From the `placement-portal-backend` folder:

```bash
# seed
node scripts/seed-demo.js

# wipe
node scripts/clear-demo.js
```

The scripts rely on `DATABASE_URL` from your `.env` (same as the rest of the
backend). No extra install is required — they only use `@prisma/client` and
`bcryptjs`, both already in `package.json`.

## What gets created (medium dataset)

| Entity            | Approx count |
|-------------------|--------------|
| Admin             | 1            |
| TPO               | 1            |
| HOD               | 1            |
| Recruiters        | 10 (one per company, each with a company profile) |
| Students          | 40 (each with a full student profile: marks, skills, projects, GitHub/LinkedIn) |
| Jobs              | 15 (across all 10 companies; a few posted by the TPO) |
| Rounds            | ~45 (2–4 per job) |
| Applications      | ~80 (spread across every `application_status`) |
| Round candidates  | Linked to applications past the "applied" stage |
| Events            | 10 (pre-placement talks, drives, workshops — dated in the future) |

## Sample logins

All demo accounts share the password **`Demo@1234`** (meets the project's
strong-password policy: upper + lower + digit + special, 8+ chars).

```
Admin      →  admin@demo.placement.local
TPO        →  tpo@demo.placement.local
HOD        →  hod@demo.placement.local
Recruiter  →  recruiter.flipkart@demo.placement.local
            recruiter.infosys@demo.placement.local   … one per company
Student    →  <firstname>.<lastname><index>@demo.placement.local
            (the seeder prints the first student's exact email at the end)
```

## Idempotency notes

- `seed-demo.js` is safe to re-run. Users, student profiles and company
  profiles use `upsert`, so repeat runs update rather than duplicate.
- Jobs, rounds, applications, round candidates and events are
  delete-and-recreate on every run, so the mix stays deterministic.
- `clear-demo.js` deletes in FK-safe order (round candidates → applications
  → rounds → jobs → events → SSO tickets → student/company profiles → OTPs
  → users) and only ever touches rows tied to the demo email domain.
