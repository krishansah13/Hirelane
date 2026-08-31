# Task 16 - Nodemailer stage-change email

**Status:** done

## Scope

`src/lib/email.ts` sends one email to the applicant when an employer changes stage. Called from the pipeline Server Action. SMTP credentials stay server-only (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`). Do not fail the stage write if email send fails; log the error.

Not Resend. No `RESEND_*` keys. Do not import `email.ts` from Client Components.

## Done when

- A real stage change triggers an email send
- Keys are not imported in Client Components

## Completed

- [`src/lib/email.ts`](../../src/lib/email.ts) - Nodemailer; skips/logs if SMTP env is missing; send errors are caught
- [`src/lib/actions/pipeline.ts`](../../src/lib/actions/pipeline.ts) - after `save()`, loads seeker `name`/`email`, job `title`, calls `sendStageChangeEmail`
- [`.env.example`](../../.env.example) - `SMTP_*` (no Resend)
