# Task 13 - Employer post, edit, publish

**Status:** done

## Scope

- `/employer` lists jobs for `session.user.companyId`
- `/employer/jobs/new` multi-step form (Server Actions + `useActionState`)
- `/employer/jobs/[id]/edit` for the same company
- Publish from draft
- On publish/edit: `revalidateTag("jobs")` and `revalidateTag("job:{slug}")`

Ownership is `companyId` in the query, not a UI-only check.

## Done when

- Employer can create a draft, publish it, and edit it
- Another company's job id 404s
- Public list/detail pick up the write without a redeploy

## Completed

- [`src/lib/employer-query.ts`](../../src/lib/employer-query.ts) - `getCompanyJobs` / `getCompanyJobById` scoped to `companyId`
- [`src/components/JobStatusBadge.tsx`](../../src/components/JobStatusBadge.tsx) - draft / published / expired badge
- [`src/app/(dashboard)/employer/page.tsx`](../../src/app/(dashboard)/employer/page.tsx) - company job list + links to new/edit
- [`src/lib/actions/jobs.ts`](../../src/lib/actions/jobs.ts) - `createJob` / `updateJob` / `publishJob`; ownership via `companyId`; `revalidateJobBoard` on publish and published edits
- [`src/lib/cache.ts`](../../src/lib/cache.ts) - `revalidateTag("jobs")` and `revalidateTag("job:{slug}")`
- [`src/lib/validation.ts`](../../src/lib/validation.ts) - `jobWriteSchema`, per-step `jobStepSchemas`, `JOB_FIELD_STEP`
- [`src/components/JobWriteForm.tsx`](../../src/components/JobWriteForm.tsx) - four-step wizard, `useActionState`, single form (Save draft / Publish role)
- [`src/app/(dashboard)/employer/jobs/new/page.tsx`](../../src/app/(dashboard)/employer/jobs/new/page.tsx)
- [`src/app/(dashboard)/employer/jobs/[id]/edit/page.tsx`](../../src/app/(dashboard)/employer/jobs/[id]/edit/page.tsx) - `notFound()` when the job is missing or belongs to another company
