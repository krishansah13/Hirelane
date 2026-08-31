# Task 05 - `/jobs` URL-driven search, filters, pagination

**Status:** done (already in repo)

## Scope

`q`, `location`, `type`, `remote`, `sort`, `page` live in the URL. Filters are a Client Component that pushes search params. Server re-queries via `getJobs`.

## Done when

- A copied filtered URL reproduces the same results
- Only published jobs appear
- Pagination is URL-driven
