# Task 07 - Foundation gaps

**Status:** done

## Scope

Close remaining Milestone 1 gaps without rebuilding auth or the public board.

1. Dashboard nested layout with a role-aware sidebar (seeker vs employer links).
2. `src/proxy.ts` / `auth.config.ts`: redirect employers away from `/dashboard` and seekers away from `/employer`.
3. Put `companyId` on the JWT/session for employers.
4. Application `stageHistory` embedded array; unique compound index on `(jobId, userId)`.
5. Seed writes `stageHistory` and unique applications.
6. `.env.example` listing `MONGO_URI`, `AUTH_SECRET`, Cloudinary, Resend.

## Done when

- Dashboard chrome has a sidebar; stubs can remain until later tasks fill pages
- Typing `/employer` as a seeker redirects to `/dashboard` at the proxy/auth layer
- Re-seed succeeds with unique `(jobId, userId)` and history entries
- `.env.example` exists and is not secret-filled

## Completed

- [`src/components/DashboardSidebar.tsx`](../../src/components/DashboardSidebar.tsx) + dashboard layout chrome
- Role redirects in [`src/auth.config.ts`](../../src/auth.config.ts); matcher covers bare `/dashboard` and `/employer` in [`src/proxy.ts`](../../src/proxy.ts)
- `companyId` on authorize → JWT → session
- [`Application`](../../src/lib/models/Application.ts) `stageHistory` + unique `(jobId, userId)`
- Seed dedupes pairs and writes history
- [`.env.example`](../../.env.example)
