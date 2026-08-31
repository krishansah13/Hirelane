# Task 12 - Seeker application tracking

**Status:** done

## Scope

- `/dashboard` lists the session user's applications (server-rendered)
- `/dashboard/applications/[id]` shows detail; stage history in `Suspense`
- Query includes `userId: session.user.id`. Other users' ids 404

## Done when

- Seeker sees only their applications
- Detail shows current stage and history
- Employer cannot read this data (proxy already sends them to `/employer`)

## Completed

- [`src/lib/application-query.ts`](../../src/lib/application-query.ts) - list/detail/history helpers scoped to `userId`
- [`src/app/(dashboard)/dashboard/page.tsx`](../../src/app/(dashboard)/dashboard/page.tsx) - seeker application list
- [`src/app/(dashboard)/dashboard/applications/[id]/page.tsx`](../../src/app/(dashboard)/dashboard/applications/[id]/page.tsx) - detail; stage history in `Suspense`
- [`ApplicationStageHistory`](../../src/components/ApplicationStageHistory.tsx) + [`StageBadge`](../../src/components/StageBadge.tsx)
- [`DashboardSidebar`](../../src/components/DashboardSidebar.tsx) - detail nav shows job title via [`application-nav`](../../src/lib/actions/application-nav.ts)
