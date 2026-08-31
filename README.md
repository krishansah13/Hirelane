# Hirelane

Hirelane is a two-sided job board and applicant tracking platform.

The **public** side is a fast, crawlable job board: search, filter, share URLs, and open jobs in a soft-nav modal or as a full detail page. The **private** side is an authenticated ATS for seekers (apply and track stages) and employers (post roles and move applicants through a pipeline).

This repo is a Next.js capstone build. Mandatory features through deploy are in place. Live: [https://hirelane-flax.vercel.app/](https://hirelane-flax.vercel.app/).

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | React 19, Tailwind CSS 4, Lucide |
| Database | MongoDB + Mongoose |
| Auth | Auth.js (NextAuth v5) Credentials + JWT roles |
| Validation | Zod |
| Uploads | Cloudinary (resume PDFs, server-only keys) |
| Email | Nodemailer (stage-change notifications, `SMTP_*` server-only) |

## Features

### Done

- Credentials login with `seeker` / `employer` roles
- Route protection and role redirects via `src/proxy.ts`
- Landing page with featured published roles
- `/jobs` search, filters, sort, and pagination entirely in the URL
- `/jobs/[slug]` detail with ISR, metadata, sitemap, and robots
- Soft-nav job modal via parallel + intercepting routes (`@modal/(.)jobs/[slug]`)
- Tagged cache reads (`jobs`, `job:{slug}`) for list and detail
- Resume upload (`POST /api/upload`) and apply Server Action
- Seeker applications dashboard + streamed stage history
- Employer job post/edit/publish with `revalidateTag`
- Applicant pipeline with valid stage transitions
- Public `GET /api/jobs` and `GET /api/jobs/[id]` (shared `job-query.ts`)
- Nodemailer stage-change email (`SMTP_*`, from the pipeline Server Action)
- Seed script with demo companies, jobs, and users
- Production deploy on Vercel ([hirelane-flax.vercel.app](https://hirelane-flax.vercel.app/))

Full product rules live in [`plan/spec/spec.md`](plan/spec/spec.md). Task progress is tracked in [`plan/tasks/task.md`](plan/tasks/task.md). Bonus items in the spec are optional after the mandatory build.

## Roles

| Role | Can |
| --- | --- |
| Visitor | Browse and search published jobs; cannot apply |
| Seeker | Apply with a resume PDF; track application stages |
| Employer | Post/edit company roles; move applicants through the pipeline |

There is no admin role in the mandatory build. Signup is out of scope - use seeded accounts.

## Getting started

### Prerequisites

- Node.js 20+
- MongoDB running locally (or a connection string to a hosted cluster)

### Setup

```bash
git clone <your-repo-url>
cd next-capstone-project
npm install
cp .env.example .env
```

Fill `.env` (at minimum `MONGO_URI` and `AUTH_SECRET`):

```env
MONGO_URI=mongodb://127.0.0.1:27017/hirelane
AUTH_SECRET=generate-a-long-random-string
AUTH_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Hirelane <you@gmail.com>
```

`NEXT_PUBLIC_APP_URL` is optional; sitemap/robots fall back to `http://localhost:3000`.

### Seed the database

```bash
npm run seed
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production

Live app: [https://hirelane-flax.vercel.app/](https://hirelane-flax.vercel.app/).

On the host, set the same secrets as `.env.example`, and point Auth.js at the public origin:

```env
AUTH_URL=https://hirelane-flax.vercel.app
NEXT_PUBLIC_APP_URL=https://hirelane-flax.vercel.app
```

Do not put Cloudinary or SMTP keys in `NEXT_PUBLIC_*` variables.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run seed` | Reset/seed MongoDB demo data |

## Demo accounts

After seeding:

| Role | Email | Password |
| --- | --- | --- |
| Seeker | `seeker1@example.com` | `Seeker@123` |
| Employer | `rahul@technova.com` | `Employer@123` |

## Project structure

```text
src/
  app/
    (public)/          # Landing, /jobs, /jobs/[slug], intercepting @modal
    (dashboard)/       # Seeker /dashboard and employer /employer
    api/auth/          # Auth.js route handlers
    api/jobs/          # Public GET /api/jobs and /api/jobs/[id]
    api/upload/        # Seeker resume PDF upload
    login/             # Credentials login
    sitemap.ts
    robots.ts
  components/          # UI: cards, filters, landing, modal, sidebar
  lib/
    models/            # User, Company, Job, Application
    job-query.ts       # Cached public job reads
    scripts/seed.ts
    validation.ts
  auth.ts
  auth.config.ts
  proxy.ts             # Auth + role gate
plan/
  spec/spec.md         # Product specification
  tasks/               # Capstone task tracker
```

## Key routes

| Route | Notes |
| --- | --- |
| `/` | Landing (cached featured roles) |
| `/jobs` | URL-driven search / filter / sort / page |
| `/jobs/[slug]` | Full job detail (SSG + ISR) |
| Soft nav from `/jobs` | Modal overlay via `@modal/(.)jobs/[slug]` |
| `/login` | Credentials |
| `/dashboard` | Seeker area (protected) |
| `/employer` | Employer area (protected) |

### `/jobs` query contract

| Param | Values |
| --- | --- |
| `q` | Free text (title, description, location, company) |
| `location` | Substring match |
| `type` | `full-time` \| `part-time` \| `contract` \| `internship` |
| `remote` | `true` \| `false` \| `any` |
| `sort` | `newest` \| `oldest` |
| `page` | Positive integer (default `1`) |

Copied URLs reproduce the same results.

## Public jobs API

Same filter contract as `/jobs`. The page and these handlers both call `getJobs` / `getJobById` in `src/lib/job-query.ts`.

### `GET /api/jobs`

| Param | Values |
| --- | --- |
| `q` | Free text (title, description, location, company) |
| `location` | Substring match |
| `type` | `full-time` \| `part-time` \| `contract` \| `internship` |
| `remote` | `true` \| `false` \| `any` |
| `sort` | `newest` \| `oldest` |
| `page` | Positive integer (default `1`) |
| `limit` | 1–50 (default `10`) |

**200** - `{ jobs, total, page, limit, totalPages }`  
**400** - invalid query (bad `type`, `sort`, `page`, `limit`, …)

Example: `/api/jobs?q=engineer&remote=true&sort=newest&page=1`

### `GET /api/jobs/[id]`

**200** - one published job (company populated)  
**400** - `id` is not a 24-char hex ObjectId  
**404** - missing, draft, or expired

Responses send `Cache-Control: no-store`. Published list/detail data still uses the tagged server cache inside `job-query.ts`.

## Data model (summary)

Four flat models: **User**, **Company**, **Job**, **Application**.

- Job status: `draft` \| `published` \| `expired`
- Application stage: `applied` → `screening` → `interview` → `offer` (or `rejected` from most stages)
- Unique compound index: `(jobId, userId)` - one application per seeker per job
- `stageHistory` is embedded on Application (not a separate collection)

## Docs

- Spec: [`plan/spec/spec.md`](plan/spec/spec.md)
- Tasks: [`plan/tasks/task.md`](plan/tasks/task.md)

## License

Private / coursework - not licensed for redistribution unless you add one.
