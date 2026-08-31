# Task 11 - Apply Server Action + form

**Status:** done

## Scope

Zod-validated Server Action creates an Application (`stage: applied`, history seed). Client form uses `useActionState` / `useFormStatus`. Resume goes client → `/api/upload` → action. Visitors go to login. Duplicate `(jobId, userId)` is rejected. Cover note survives a failed upload.

Wire the form on the full job page and the intercepting modal.

## Done when

- A seeker can apply once per job with a PDF and optional cover note
- A visitor is sent to `/login?callbackUrl=...`
- A second apply returns a validation error, not a second row

## Completed

- [`src/lib/actions/apply.ts`](../../src/lib/actions/apply.ts) - Zod `applySchema`; seeker-only; seeds `stageHistory`; duplicate pre-check + Mongo `11000` catch
- [`src/components/ApplyForm.tsx`](../../src/components/ApplyForm.tsx) - `useActionState` / `useFormStatus`; upload then action; cover note in local state; visitor → `/login?callbackUrl=...`
- Full page + modal wired - [`jobs/[slug]/page.tsx`](../../src/app/(public)/jobs/[slug]/page.tsx) (desktop + mobile) and [`JobModal`](../../src/components/JobModal.tsx)
- Unique `(jobId, userId)` index ensured via cleanup + [`Application.syncIndexes()`](../../src/lib/scripts/seed.ts) in seed
