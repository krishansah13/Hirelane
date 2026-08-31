# Task 15 - Public jobs API

**Status:** done

## Scope

- `GET /api/jobs` - same filter/sort/page contract as `/jobs`, shared `getJobs`
- `GET /api/jobs/[id]` - one published job
- Zod validation; 400 on bad params; 404 when missing
- Document the contract in README

## Done when

- UI and API cannot drift because they share `job-query.ts`
- Status codes are correct

## Completed

- [`src/lib/job-query.ts`](../../src/lib/job-query.ts) - `toJobQuery` maps URL params (`remote` true/false/any) for both UI and API
- [`src/components/JobResults.tsx`](../../src/components/JobResults.tsx) - `/jobs` uses `getJobs(toJobQuery(...))`
- [`src/app/api/jobs/route.ts`](../../src/app/api/jobs/route.ts) - `GET /api/jobs`; Zod `safeParse`; 400 on bad query; `Cache-Control: no-store`
- [`src/app/api/jobs/[id]/route.ts`](../../src/app/api/jobs/[id]/route.ts) - `GET /api/jobs/[id]`; invalid ObjectId 400; missing/draft/expired 404
- [`README.md`](../../README.md) - public API contract
