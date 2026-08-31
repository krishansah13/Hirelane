# Hirelane specification

Hirelane is a two-sided job board and applicant tracking platform. The public half is a fast, crawlable job board. The private half is an authenticated ATS: seekers apply and track stages; employers post roles and move applicants through a pipeline.

## Roles

- **Visitor** - browse, search, and read published jobs and the public API. Cannot apply.
- **Seeker** - apply with a resume PDF, track their own applications.
- **Employer** - belongs to one company; post and edit that company's roles; move applicants through stages.

No administrator role in the mandatory build.

## Business requirements (SRS)

- Role-based access is enforced across visitor, seeker, and employer.
- Jobs are searchable and filterable; any filtered view is shareable by URL.
- A seeker can apply with a resume and track each application's stage.
- An employer can post a role, publish it, and move applicants through the pipeline.
- Public job pages are crawlable and carry per-job metadata.
- The board is readable through a documented public API, and applicants are emailed on a stage change.
- The application is deployed successfully.

## Functional requirements

| ID | Requirement | Where it is built | Status |
| --- | --- | --- | --- |
| FR-001 | Authentication and roles | Auth.js credentials, JWT role, `src/proxy.ts` | done |
| FR-002 | Search and filtering | `/jobs`, URL search params only | done |
| FR-003 | Job detail and discoverability | `/jobs/[slug]`, `generateStaticParams`, `generateMetadata`, sitemap | done |
| FR-004 | Quick view from the list | Parallel + intercepting route `@modal/(.)jobs/[slug]` | done |
| FR-005 | Apply with a resume | Server Action + `POST /api/upload` | done |
| FR-006 | Application tracking | `/dashboard`, `/dashboard/applications/[id]` | done |
| FR-007 | Post a job (multi-step) | `/employer`, `/employer/jobs/new`, `/employer/jobs/[id]/edit` | done |
| FR-008 | Applicant pipeline | `/employer/jobs/[id]/applicants` | done |
| FR-009 | Board correct after a write | Tagged reads + `revalidateTag` on publish/edit | done |
| FR-010 | Public jobs API | `GET /api/jobs`, `GET /api/jobs/[id]`, shared `job-query` | done |
| FR-011 | Email notifications | Nodemailer on stage change | done |

## Tech stack

- Next.js 16 App Router + TypeScript
- MongoDB + Mongoose
- Auth.js (NextAuth v5) Credentials provider
- Cloudinary for resume PDFs (server-only keys)
- Nodemailer for stage-change email
- Zod for validation

## Data model

Four flat models. No relationship deeper than one level.

**User** - `id`, `name`, `email`, `passwordHash`, `role` (`seeker` \| `employer`), `companyId`

**Company** - `id`, `name`, `slug`, `logoURL`, `website`, `about`

**Job** - `id`, `companyId`, `postedById`, `title`, `slug`, `description`, `location`, `type`, `isRemote`, `salaryMin`, `salaryMax`, `status` (`draft` \| `published` \| `expired`), `publishedAt`, `expiresAt`

**Application** - `id`, `jobId`, `userId`, `resumeURL`, `coverNote`, `stage` (`applied` \| `screening` \| `interview` \| `offer` \| `rejected`), `appliedAt`, `stageChangedAt`, `stageHistory[]` (`{ stage, changedAt }`)

`stageHistory` is an embedded array on Application (not a fifth model) so the seeker detail page can stream history.

Unique compound index: `(jobId, userId)` - one application per seeker per job.

Expired jobs are a `status` field checked in queries, not a cron.

## Routes

### Public

- `/` - landing with featured roles (cached)
- `/jobs` - search/filter/sort/page entirely in the URL; results streamed
- `/jobs/[slug]` - public job detail; SSG/ISR + per-job metadata
- Intercepting modal: `@modal/(.)jobs/[slug]` over `/jobs`

### Auth

- `/login` - credentials. No signup in the mandatory build; use seeded accounts.

### Seeker (protected)

- `/dashboard` - the seeker's applications
- `/dashboard/applications/[id]` - detail and stage history

### Employer (protected)

- `/employer` - posted roles for the employer's company
- `/employer/jobs/new` - multi-step post form
- `/employer/jobs/[id]/edit` - edit an existing role
- `/employer/jobs/[id]/applicants` - hiring pipeline

### Route Handlers

- `GET/POST /api/auth/[...nextauth]`
- `GET /api/jobs` - filter, sort, paginate (same contract as `/jobs`)
- `GET /api/jobs/[id]` - one published job
- `POST /api/upload` - resume PDF proxy to Cloudinary

## URL search contract (`/jobs` and `GET /api/jobs`)

| Param | Values |
| --- | --- |
| `q` | free text across title, description, location, company name |
| `location` | substring match |
| `type` | `full-time` \| `part-time` \| `contract` \| `internship` |
| `remote` | `true` \| `false` \| `any` |
| `sort` | `newest` \| `oldest` |
| `page` | positive integer, default 1 |

Public list queries only `status: "published"`. Filter state lives in the URL, not React state. A copied URL must reproduce the same page.

## Rendering strategy

Deliberate choice per route, not the framework default left unexamined.

| Route | Strategy | Why |
| --- | --- | --- |
| `/` | Cached / ISR via tagged `getLandingContent` | Fastest page; featured jobs change rarely |
| `/jobs` | Dynamic SSR from searchParams; header/filters paint immediately; results in `Suspense` | URL is the source of truth; results are the slow read |
| `/jobs/[slug]` | SSG + ISR (`generateStaticParams`, `revalidate` window, tagged read) | Crawlable; revalidated on publish/edit |
| Modal intercept | Client overlay; same `getJobBySlug` data as the full page | FR-004 |
| `/login` | Dynamic | Session-dependent redirect |
| `/dashboard/**` | `force-dynamic` | Per-user private data |
| `/employer/**` | `force-dynamic` | Per-company private data |
| `GET /api/jobs*` | Dynamic | Public read API; validates params; no user cache |
| `POST /api/upload` | Dynamic | Authenticated write |

## Cache tags

Decided before the first cached read:

- `jobs` - landing featured list, `/jobs` list, sitemap job index, public API list helper
- `job:{slug}` - individual published job detail

On publish or edit of a job: `revalidateTag("jobs")` and `revalidateTag("job:{slug}")`.

## Authorization

Enforced in the query / Server Action / Route Handler, not by hiding UI.

- Unauthenticated users cannot reach `/dashboard` or `/employer` (`proxy.ts`).
- Seekers hitting `/employer` redirect to `/dashboard`. Employers hitting `/dashboard` redirect to `/employer`.
- A seeker reads and creates applications only where `userId` equals the session user id.
- An employer reads/writes jobs and applications only where the job's `companyId` equals the session user's `companyId`.
- `POST /api/upload` requires a seeker session.
- Visitors cannot apply; they are sent to `/login?callbackUrl=...`.
- Reviewer will type another user's application or job id into the URL. Those requests 404, they do not leak data.

## Stage transitions

| From | Allowed next |
| --- | --- |
| `applied` | `screening`, `rejected` |
| `screening` | `interview`, `rejected` |
| `interview` | `offer`, `rejected` |
| `offer` | none (terminal) |
| `rejected` | none (terminal) |

On a valid change: update `stage`, `stageChangedAt`, append `stageHistory`, send a Nodemailer email.

## Apply and upload

1. Seeker selects a PDF and an optional cover note (cover note held in client state).
2. Browser `POST`s the file to `/api/upload`.
3. Handler authenticates, checks PDF, uploads to Cloudinary with server env vars, returns `{ url }`.
4. Apply Server Action validates with Zod and inserts the Application (`stage: applied`).
5. Failed upload does not wipe the cover note (`useActionState` + local cover-note state).

Cloudinary keys never reach the browser.

Env: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## Email

Nodemailer sends one email to the applicant when an employer changes their stage. `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` are server-only. A send failure is logged; the stage write still succeeds.

## Validation

Zod on:

- Job search params (`jobQuerySchema`)
- Apply action
- Job create/edit/publish actions
- Stage-change action
- `GET /api/jobs` query string

Server validates even if the client also checks.

## Out of scope (mandatory)

Saved jobs, public company profile pages, admin role, draft previews, generated social images, scheduled expiry, payments, seeker–employer messaging, signup.

Bonus: choose any two after all mandatory tasks pass.

## Seeded demo accounts

- Seeker: `seeker1@example.com` / `Seeker@123`
- Employer: `rahul@technova.com` / `Employer@123`

## Production

Deployed at [https://hirelane-flax.vercel.app/](https://hirelane-flax.vercel.app/). Hosted MongoDB, Auth.js, Cloudinary, and SMTP env vars are server-only on Vercel. See [`plan/tasks/task18/task.md`](../tasks/task18/task.md).

## Rendering and authz audit log

Completed. Full walk: [`plan/tasks/task17/task.md`](../tasks/task17/task.md).

- Proxy + layouts gate `/dashboard` and `/employer` by session and role.
- Seeker reads use `userId` in the query (`getMyApplicationById`, apply, nav title).
- Employer reads/writes use `companyId` on the Job (`getCompanyJobById`, job actions, pipeline).
- Foreign application / job ids `notFound()`; they do not return the other party's data.
- Public API: `GET /api/jobs*` is `force-dynamic` with `Cache-Control: no-store`; data still from tagged `job-query`.
- Stage-change mail: Nodemailer (`src/lib/email.ts`, `SMTP_*`) from `updateApplicationStage` after save.
