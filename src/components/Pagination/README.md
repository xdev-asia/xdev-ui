# Pagination

Previous and next buttons with a range text ("1–20 of 57") and an optional page-size select, for a controlled list.

## Anatomy
`nav.x-pagination` > optional `Select` (page size), `span.x-pagination-range`, `span.x-pagination-step` with two `IconButton`s.

## Rules
- Controlled: the parent owns `page` (1-based) and `pageSize` and slices the rows (see `paginateRows` in `DataTable`).
- No numbered pages: previous and next plus the range fit 360px and read the same in every language.
- Previous is disabled on the first page and next on the last; they are never hidden.
- `pageSizeOptions` adds a native `Select` named by `labels.pageSize`; reset `page` to 1 when the size or a filter changes.
- Place it under the table, end-aligned. Hide it when everything fits on one page only if the table is not filterable; otherwise keep the range text.
- The range text is a polite live region, so a screen reader hears the new range after a page change.
- `labels` (`PaginationLabels`: `nav`, `previous`, `next`, `range(from, to, total)`, `pageSize`) overrides the English defaults; pass translated strings from the app.
