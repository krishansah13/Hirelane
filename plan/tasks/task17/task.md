# Task 17 - Authorization + rendering audit

**Status:** done

## Scope

Phase 3 gate (milestone 5): walk every Server Action and Route Handler. Ownership must be in the query (`userId` or `companyId`), not only the route guard or hidden UI. Record a rendering-strategy choice per route (not the framework default left unexamined). This file is the audit log; it should match `plan/spec/spec.md`.

Not in this task: production deploy, PR merge, smoke tests (task 18).

## Done when

- Seeker cannot reach `/employer` (redirect to `/dashboard`)
- Employer cannot reach `/dashboard` (redirect to `/employer`)
- Pasting another seeker's application id 404s (no leaked data)
- Pasting another company's job id 404s on edit and applicants
- Rendering choices are written down, not implied

## Naming vs the Phase 3 PDF

| PDF | This repo |
| --- | --- |
| `middleware.ts` | `src/proxy.ts` (Next.js 16 Auth.js gate; same `authorized` callback) |
| Resend | Nodemailer + `SMTP_*` (FR-011; see task 16) |
| Suggested tree omits edit | `/employer/jobs/[id]/edit` exists (FR-007) |

## Rendering table

Deliberate choice per route.

| Route | Strategy | Why / evidence |
| --- | --- | --- |
| `/` | Cached via tagged `getLandingContent` | Fastest page; tag `jobs` |
| `/jobs` | Dynamic SSR from `searchParams`; results in `Suspense` | URL is the only filter state; `JobResults` → `getJobs` |
| `/jobs/[slug]` | SSG + ISR | `generateStaticParams`, `revalidate = 3600`, tagged `getJobBySlug` (`jobs`, `job:{slug}`). Unpublished/expired/unknown → `notFound()` (query is `status: "published"`) |
| `@modal/(.)jobs/[slug]` | Intercept overlay; same `getJobBySlug` | Direct load of that URL is the full page (FR-004) |
| `/login` | Dynamic | Session-dependent redirect |
| `/dashboard/**` | `force-dynamic` | `(dashboard)/layout.tsx`; per-user private data |
| `/employer/**` | `force-dynamic` | Same layout; per-company private data |
| `GET /api/jobs` | `force-dynamic` + `Cache-Control: no-store` | Public read; Zod; still uses tagged `getJobs` |
| `GET /api/jobs/[id]` | `force-dynamic` + `Cache-Control: no-store` | Published only; 400 invalid id; 404 missing/draft/expired |
| `POST /api/upload` | Dynamic | Seeker session; Cloudinary keys server-only |
| `GET/POST /api/auth/[...nextauth]` | Auth.js | Session |

Cache tags (chosen before the first cached read): `jobs` (landing, list, sitemap, `getJobs` / `getJobById`); `job:{slug}` (detail). Publish/edit call `revalidateJobBoard` → `revalidateTag("jobs")`, `revalidateTag("job:{slug}")`, plus path revalidation.

## Authorization walk

Layers (all required; layout alone is not enough):

1. **`src/proxy.ts`** - matcher `/dashboard`, `/dashboard/:path*`, `/employer`, `/employer/:path*`. Unauthenticated → login. Employer on `/dashboard` → `/employer`. Seeker on `/employer` → `/dashboard`.
2. **Layouts** - `(dashboard)/layout.tsx` requires a session. `dashboard/layout.tsx` requires `seeker`. `employer/layout.tsx` requires `employer`.
3. **Query / action / handler** - `userId` or `companyId` in the Mongo filter.

Visitors cannot apply; `ApplyForm` sends them to `/login?callbackUrl=...`. Upload and apply still reject non-seekers on the server.

### Pages (id in URL → 404, no leak)

| Path | Ownership |
| --- | --- |
| `/dashboard/applications/[id]` | `getMyApplicationById(user.id, id)` → `notFound()` |
| Stage history (`Suspense`) | `getMyApplicationStageHistory(userId, applicationId)` → `notFound()` |
| `/employer/jobs/[id]/edit` | `getCompanyJobById(companyId, id)` → `notFound()` |
| `/employer/jobs/[id]/applicants` | `getJobApplicants` via `getCompanyJobById` → `notFound()` |

### Server Actions

| Action | Gate |
| --- | --- |
| `applyToJob` | Session + `role === seeker`; job must be `published`; unique `(jobId, userId)` |
| `createJob` / `updateJob` / `publishJob` | Session + employer + `companyId`; update/publish `findOne({ _id, companyId })` |
| `updateApplicationStage` | Session + employer + `companyId`; job `findOne({ _id: application.jobId, companyId })`; `canTransition`; then `sendStageChangeEmail` |
| `getApplicationNavTitle` | Seeker session; `getMyApplicationById(session.user.id, …)`; else `null` |

### Route Handlers

| Handler | Gate |
| --- | --- |
| `POST /api/upload` | Authenticated seeker (401 / 403) |
| `GET /api/jobs` | Public; Zod 400 |
| `GET /api/jobs/[id]` | Public; published only |

## Confirmed

- Seeker opens `/employer` → `/dashboard`
- Employer opens `/dashboard` → `/employer`
- Seeker A: `/dashboard/applications/<B's id>` → 404
- Employer A: `/employer/jobs/<B's job id>/edit` and `…/applicants` → 404
- Invalid stage jump (e.g. applied → offer) rejected in the action
- Unknown or expired slug on `/jobs/[slug]` → 404
