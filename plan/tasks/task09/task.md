# Task 09 - Intercepting job modal

**Status:** done

## Scope

Parallel + intercepting route: clicking a job on `/jobs` opens a modal; the URL becomes `/jobs/[slug]`. Loading that URL directly still renders the full page. Both use `getJobBySlug`.

Files:

- `src/app/(public)/layout.tsx` with `{ children, modal }`
- `src/app/(public)/@modal/default.tsx` returning `null`
- `src/app/(public)/@modal/(.)jobs/[slug]/page.tsx`

## Done when

- From `/jobs`, a card click shows a modal without a full-page navigation
- Refresh or direct URL shows the existing full page
- Modal and page show the same job data

## Completed

- [`src/app/(public)/layout.tsx`](../../src/app/(public)/layout.tsx) - parallel slot `{ children, modal }`
- [`src/app/(public)/@modal/default.tsx`](../../src/app/(public)/@modal/default.tsx) - returns `null` when no modal is active
- [`src/app/(public)/@modal/(.)jobs/[slug]/page.tsx`](../../src/app/(public)/@modal/(.)jobs/[slug]/page.tsx) - intercepts soft nav; loads via `getJobBySlug`
- [`JobModal`](../../src/components/JobModal.tsx) - client overlay (Esc / backdrop / close → `router.back()`); Apply stub + hard-link “View full details” for task 11
