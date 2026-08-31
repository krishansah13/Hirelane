# Task 14 - Applicant pipeline

**Status:** done

## Scope

`/employer/jobs/[id]/applicants` grouped by stage. Role-checked Server Action moves an applicant only along allowed transitions. Job must belong to the employer's `companyId`.

## Done when

- Employer sees applicants for their job only
- Invalid jumps (e.g. applied → offer) are rejected
- Foreign job id 404s

## Completed

- [`src/lib/stage-transitions.ts`](../../src/lib/stage-transitions.ts) - allowed next stages; `canTransition` rejects illegal jumps
- [`src/lib/employer-query.ts`](../../src/lib/employer-query.ts) - `getJobApplicants` via `getCompanyJobById` (`companyId`); `null` for foreign/invalid ids
- [`src/lib/actions/pipeline.ts`](../../src/lib/actions/pipeline.ts) - `updateApplicationStage`; ownership on the Job query; updates `stage`, `stageChangedAt`, `stageHistory`
- [`src/components/StageMoveForm.tsx`](../../src/components/StageMoveForm.tsx) - `useActionState`; only allowed next-stage buttons
- [`src/app/(dashboard)/employer/jobs/[id]/applicants/page.tsx`](../../src/app/(dashboard)/employer/jobs/[id]/applicants/page.tsx) - board grouped by `STAGE_ORDER`; `notFound()` when the job is not this company
- [`src/app/(dashboard)/employer/page.tsx`](../../src/app/(dashboard)/employer/page.tsx) - Applicants link per role

Email on stage change is task 16.
