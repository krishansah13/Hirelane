# Task 08 - Public SEO, cache, streaming

**Status:** done

## Scope

1. `/jobs/[slug]`: `generateStaticParams`, `generateMetadata`, ISR `revalidate` window.
2. `src/app/sitemap.ts` and `src/app/robots.ts` for published jobs.
3. Wrap `/jobs` results in `Suspense` so header/filters paint while results stream.
4. Tag cached reads: `jobs` and `job:{slug}` in `job-query.ts`.
5. Fix `job.remote` → `isRemote`; format salary as INR.

## Done when

- Direct load of a published slug has title/description metadata
- Sitemap lists published jobs
- `/jobs` streams the list independently of the hero
- Job detail shows Remote/On-site from `isRemote` and INR salaries

## Completed

- [`src/app/(public)/jobs/[slug]/page.tsx`](../../src/app/(public)/jobs/[slug]/page.tsx) - `revalidate = 3600`, `generateStaticParams`, `generateMetadata`; `isRemote` + `formatInr`
- [`src/app/sitemap.ts`](../../src/app/sitemap.ts) + [`src/app/robots.ts`](../../src/app/robots.ts) - published job URLs; private paths disallowed
- [`src/app/(public)/jobs/page.tsx`](../../src/app/(public)/jobs/page.tsx) - hero/filters outside `Suspense`; [`JobResults`](../../src/components/JobResults.tsx) streams the list
- [`src/lib/job-query.ts`](../../src/lib/job-query.ts) - tags `jobs` and `job:{slug}` (already in place)
- [`JobCard`](../../src/components/JobCard.tsx) / [`JobTypes`](../../src/types/JobTypes.ts) - `isRemote` only on the job model surface
