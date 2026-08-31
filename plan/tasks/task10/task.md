# Task 10 - Cloudinary resume upload

**Status:** done

## Scope

`POST /api/upload` accepts a PDF from an authenticated seeker, uploads via Cloudinary with server env, returns `{ url }`. Keys never reach the client.

- `src/lib/upload.ts`
- `src/app/api/upload/route.ts`
- `next.config.ts` `remotePatterns` as needed

## Done when

- Unauthenticated / employer requests are rejected
- Non-PDF is rejected
- Success returns a Cloudinary URL

## Completed

- [`src/lib/upload.ts`](../../src/lib/upload.ts) - Cloudinary `resource_type: "raw"` PDF upload; server env only
- [`src/app/api/upload/route.ts`](../../src/app/api/upload/route.ts) - seeker session required; rejects unauthenticated, employers, non-PDFs; returns `{ url }`
- [`next.config.ts`](../../next.config.ts) - `images.remotePatterns` for `res.cloudinary.com`
