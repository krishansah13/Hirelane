# Hirelane

Hirelane is a two-sided job board and applicant tracking platform.

The **public** side is a fast, crawlable job board: search, filter, share URLs, and open jobs in a soft-nav modal or as a full detail page. The **private** side is an authenticated ATS for seekers (apply and track stages), employers (post roles and move applicants through a pipeline), and admins (users, companies, jobs, and employer approvals).

This repo is a Next.js capstone. Live: [https://hirelane-flax.vercel.app/](https://hirelane-flax.vercel.app/).

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | React 19, Tailwind CSS 4, Lucide |
| Database | MongoDB + Mongoose |
| Auth | Auth.js (NextAuth v5) Credentials + JWT roles |
| Validation | Zod |
| Uploads | Cloudinary (resume PDFs and profile photos, server-only keys) |
| Email | Nodemailer (stage changes, new-job alerts, employer approval, `SMTP_*` server-only) |

## Features

- Credentials login and `/signup` for seekers and employers
- Roles `seeker` / `employer` / `admin`, plus account status `active` / `pending` / `suspended`
- Route protection and role redirects via `src/proxy.ts` (`src/auth.config.ts`)
- Employer signups stay `pending` until an admin approves them; pending and suspended accounts cannot sign in
- Landing page with featured published roles
- `/jobs` search, filters, sort, and pagination entirely in the URL
- `/jobs/[slug]` detail with ISR, metadata, sitemap, and robots
- Soft-nav job modal via parallel + intercepting routes (`@modal/(.)jobs/[slug]`)
- Employers can open the public page only for their own company's jobs; admins can preview any live listing
- Tagged cache reads (`jobs`, `job:{slug}`) for list and detail
- Resume upload (`POST /api/upload`) and apply Server Action
- Seeker applications dashboard + streamed stage history
- Dashboard, employer, and admin lists keep search chrome mounted; results load in `Suspense`
- Employer job post/edit/publish (skills, requirements, joining date, expiry) with `revalidateTag`
- Applicant pipeline with valid stage transitions
- Account page: name, Indian mobile, and profile photo
- Admin home, users, jobs, companies, and employer approvals
- Public `GET /api/jobs` and `GET /api/jobs/[id]` (shared `job-query.ts`)
- Nodemailer emails: stage change, new published job to seekers, employer approved
- Seed script with demo companies, jobs, seekers, employers, and an admin
- Production deploy on Vercel ([hirelane-flax.vercel.app](https://hirelane-flax.vercel.app/))

Original product rules live in [`plan/spec/spec.md`](plan/spec/spec.md). Task progress for the mandatory build is in [`plan/tasks/task.md`](plan/tasks/task.md). The running app now also includes signup, admin, and account-status flows beyond that spec.

## Roles

| Role | Can |
| --- | --- |
| Visitor | Browse and search published jobs; cannot apply |
| Seeker | Sign up, apply with a resume PDF, track application stages |
| Employer | Sign up against a listed company (pending until approved); post/edit that company's roles; move applicants through the pipeline |
| Admin | Manage users, companies, and jobs; approve or remove pending employers |

Seekers become active immediately. Employers must match a company already listed by an admin (name + website). Seeded accounts are ready to use after `npm run seed`.

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
NEXT_PUBLIC_APP_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Hirelane <you@gmail.com>
```

`NEXT_PUBLIC_APP_URL` is used for sitemap/robots and for links in approval/job-alert emails. It falls back to `http://localhost:3000` when unset.

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
| `npm test` | Unit tests (`skills`, `validation`, `job-access`) |
| `npm run seed` | Reset/seed MongoDB demo data |

## Demo accounts

After seeding:

| Role | Email | Password |
| --- | --- | --- |
| Seeker | `seeker1@example.com` | `Seeker@123` |
| Employer | `rahul@technova.com` | `Employer@123` |
| Admin | `admin@example.com` | `Admin@123` |

`seeker2@example.com` is seeded as **suspended** (same seeker password) so you can try the blocked-account path. Extra employers use `Employer@123` (`priya@technova.com`, `arjun@cloudpeak.com`, and so on).



## Folder Structure
```
├── .env
├── .env.example
├── .git
├── .gitignore
├── README.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── node_modules
├── package-lock.json
├── package.json
├── plan
│   ├── spec
│   │   └── spec.md
│   └── tasks
│       ├── task.md
│       ├── task01
│       │   └── task.md
│       ├── task02
│       │   └── task.md
│       ├── task03
│       │   └── task.md
│       ├── task04
│       │   └── task.md
│       ├── task05
│       │   └── task.md
│       ├── task06
│       │   └── task.md
│       ├── task07
│       │   └── task.md
│       ├── task08
│       │   └── task.md
│       ├── task09
│       │   └── task.md
│       ├── task10
│       │   └── task.md
│       ├── task11
│       │   └── task.md
│       ├── task12
│       │   └── task.md
│       ├── task13
│       │   └── task.md
│       ├── task14
│       │   └── task.md
│       ├── task15
│       │   └── task.md
│       ├── task16
│       │   └── task.md
│       ├── task17
│       │   └── task.md
│       └── task18
│           └── task.md
├── postcss.config.mjs
├── public
│   └── images
│       └── hirelane_brand_mark.png
├── src
│   ├── Providers.tsx
│   ├── app
│   │   ├── (dashboard)
│   │   │   ├── account
│   │   │   │   └── page.tsx
│   │   │   ├── admin
│   │   │   │   ├── (home)
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── approvals
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── companies
│   │   │   │   │   ├── [id]
│   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   ├── not-found.tsx
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── jobs
│   │   │   │   │   ├── [id]
│   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   ├── not-found.tsx
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── users
│   │   │   │       └── page.tsx
│   │   │   ├── dashboard
│   │   │   │   ├── applications
│   │   │   │   │   └── [id]
│   │   │   │   │       ├── loading.tsx
│   │   │   │   │       ├── not-found.tsx
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── employer
│   │   │   │   ├── jobs
│   │   │   │   │   ├── [id]
│   │   │   │   │   │   ├── applicants
│   │   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── edit
│   │   │   │   │   │   │   ├── loading.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── not-found.tsx
│   │   │   │   │   └── new
│   │   │   │   │       ├── loading.tsx
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (public)
│   │   │   ├── (with-hero)
│   │   │   │   ├── @modal
│   │   │   │   │   ├── (.)jobs
│   │   │   │   │   │   └── [slug]
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   └── default.tsx
│   │   │   │   ├── jobs
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── icon.png
│   │   │   ├── jobs
│   │   │   │   └── [slug]
│   │   │   │       ├── loading.tsx
│   │   │   │       ├── not-found.tsx
│   │   │   │       └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── loading.tsx
│   │   ├── account-pending
│   │   │   └── page.tsx
│   │   ├── account-suspended
│   │   │   └── page.tsx
│   │   ├── api
│   │   │   ├── auth
│   │   │   │   └── [...nextauth]
│   │   │   │       └── route.ts
│   │   │   ├── jobs
│   │   │   │   ├── [id]
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   └── upload
│   │   │       └── route.ts
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── login
│   │   │   ├── LoginForm.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── not-found.tsx
│   │   ├── robots.ts
│   │   ├── signup
│   │   │   ├── SignupForm.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   └── sitemap.ts
│   ├── auth.config.ts
│   ├── auth.ts
│   ├── components
│   │   ├── ApplicationStageHistory.tsx
│   │   ├── ApplyForm.tsx
│   │   ├── CompanyLogo.tsx
│   │   ├── DashboardSidebar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Filters.tsx
│   │   ├── FooterSection.tsx
│   │   ├── HeroSection.tsx
│   │   ├── Navbar.tsx
│   │   ├── Pagination.tsx
│   │   ├── Profile.tsx
│   │   ├── SearchForm.tsx
│   │   ├── StageBadge.tsx
│   │   ├── StageMoveForm.tsx
│   │   ├── UserMenu.tsx
│   │   ├── admin
│   │   │   ├── AdminAddCompany.tsx
│   │   │   ├── AdminAddEmployer.tsx
│   │   │   ├── AdminCompaniesPagination.tsx
│   │   │   ├── AdminCompanyActions.tsx
│   │   │   ├── AdminCompanyForm.tsx
│   │   │   ├── AdminCompanyResults.tsx
│   │   │   ├── AdminCompanySearch.tsx
│   │   │   ├── AdminEmployerReviewCard.tsx
│   │   │   ├── AdminJobActions.tsx
│   │   │   ├── AdminJobResults.tsx
│   │   │   ├── AdminJobSearch.tsx
│   │   │   ├── AdminJobsPagination.tsx
│   │   │   ├── AdminRemoveEmployer.tsx
│   │   │   ├── AdminUserBadges.tsx
│   │   │   ├── AdminUserResults.tsx
│   │   │   ├── AdminUserSearch.tsx
│   │   │   ├── AdminUserStatusButton.tsx
│   │   │   └── AdminUsersPagination.tsx
│   │   ├── dashboard
│   │   │   ├── DashboardApplicationResults.tsx
│   │   │   └── DashboardSearch.tsx
│   │   ├── employer
│   │   │   ├── EmployerJobResults.tsx
│   │   │   └── EmployerJobSearch.tsx
│   │   ├── jobs
│   │   │   ├── JobCard.tsx
│   │   │   ├── JobModal.tsx
│   │   │   ├── JobNavigationGuard.tsx
│   │   │   ├── JobResults.tsx
│   │   │   ├── JobSection.tsx
│   │   │   ├── JobStatusBadge.tsx
│   │   │   ├── JobWriteForm.tsx
│   │   │   └── PersistModalBackground.tsx
│   │   ├── landing-pages
│   │   │   ├── LandingCategories.tsx
│   │   │   ├── LandingCompanies.tsx
│   │   │   ├── LandingEmployerCta.tsx
│   │   │   ├── LandingFeatured.tsx
│   │   │   ├── LandingHero.tsx
│   │   │   └── LandingHowItWorks.tsx
│   │   └── ui
│   │       ├── ConfirmModal.tsx
│   │       ├── PasswordChecks.tsx
│   │       ├── QueryPagination.tsx
│   │       ├── QuerySearchForm.tsx
│   │       ├── Skeleton.tsx
│   │       └── StatusScreen.tsx
│   ├── lib
│   │   ├── actions
│   │   │   ├── account.ts
│   │   │   ├── admin-companies.ts
│   │   │   ├── admin-jobs.ts
│   │   │   ├── admin-users.ts
│   │   │   ├── application-nav.ts
│   │   │   ├── apply.ts
│   │   │   ├── jobs.ts
│   │   │   ├── pipeline.ts
│   │   │   └── signup.ts
│   │   ├── admin-company-query.ts
│   │   ├── admin-job-query.ts
│   │   ├── admin-query.ts
│   │   ├── application-query.ts
│   │   ├── cache.ts
│   │   ├── email.ts
│   │   ├── employer-query.ts
│   │   ├── job-access.test.ts
│   │   ├── job-access.ts
│   │   ├── job-query.ts
│   │   ├── job-status.ts
│   │   ├── models
│   │   │   ├── Application.ts
│   │   │   ├── Company.ts
│   │   │   ├── Job.ts
│   │   │   └── User.ts
│   │   ├── roles.ts
│   │   ├── scripts
│   │   │   └── seed.ts
│   │   ├── session.ts
│   │   ├── stage-transitions.ts
│   │   ├── upload.ts
│   │   ├── utils
│   │   │   ├── db.ts
│   │   │   ├── format.ts
│   │   │   ├── serialize.ts
│   │   │   ├── skills.test.ts
│   │   │   ├── skills.ts
│   │   │   └── slug.ts
│   │   ├── validation.test.ts
│   │   └── validation.ts
│   ├── proxy.ts
│   └── types
│       ├── JobTypes.ts
│       └── next-auth.d.ts
├── tsconfig.json
└── tsconfig.tsbuildinfo
```


## Key routes

| Route | Notes |
| --- | --- |
| `/` | Landing (cached featured roles). Signed-in users go to their home. |
| `/jobs` | URL-driven search / filter / sort / page. Employers and admins are sent to their dashboard. |
| `/jobs/[slug]` | Full job detail (SSG + ISR) |
| Soft nav from `/jobs` | Modal overlay via `@modal/(.)jobs/[slug]` |
| `/login` | Credentials |
| `/signup` | Seeker or employer signup |
| `/account` | Profile (name, mobile, photo) for any signed-in role |
| `/account-pending` | Employer waiting for admin approval |
| `/account-suspended` | Blocked account |
| `/dashboard` | Seeker applications (protected) |
| `/dashboard/applications/[id]` | One application + stage history |
| `/employer` | Employer's company roles (protected) |
| `/employer/jobs/new` | Multi-step post form |
| `/employer/jobs/[id]/edit` | Edit an existing role |
| `/employer/jobs/[id]/applicants` | Hiring pipeline |
| `/admin` | Admin overview |
| `/admin/users` | User list, search, suspend / activate |
| `/admin/jobs` | All jobs; close or remove |
| `/admin/companies` | Companies, employers, add company / employer |
| `/admin/approvals` | Pending employer reviews |

### `/jobs` query contract

| Param | Values |
| --- | --- |
| `q` | Free text (title, description, skills, requirements, location, company) |
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
| `q` | Free text (title, description, skills, requirements, location, company) |
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

- User role: `seeker` \| `employer` \| `admin`
- User status: `active` \| `pending` \| `suspended` (employers start pending)
- User also stores optional `image` and `mobile`
- Job status: `draft` \| `published` \| `expired`
- Job also stores `skills[]`, `requirements`, optional `joiningDate`, and required `expiresAt`
- Overdue published jobs flip to `expired` when the board is queried (`expireOverduePublishedJobs`)
- Application stage: `applied` → `screening` → `interview` → `offer` (or `rejected` from most stages)
- Unique compound index: `(jobId, userId)` - one application per seeker per job
- `stageHistory` is embedded on Application (not a separate collection)

## Docs

- Spec: [`plan/spec/spec.md`](plan/spec/spec.md)
- Tasks: [`plan/tasks/task.md`](plan/tasks/task.md)

## License

Private / coursework - not licensed for redistribution unless you add one.
