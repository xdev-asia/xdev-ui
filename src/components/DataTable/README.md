# DataTable

Controlled table for lists of records: sortable headers, optional row selection, loading and empty states. It renders; the caller sorts, filters and paginates.

## Anatomy
`div.x-table-wrap` (scrolls on x inside itself) > `table.x-table` > `caption.x-sr-only`, `thead` (`th[aria-sort]` with `button.x-table-sort`, `th.x-table-check` with a `Checkbox`) and `tbody` (`tr[aria-selected]`, `td`, or `td.x-table-empty` for the empty and loading rows).

## Helpers (exported from the package)
- `nextTableSort(current, key)` returns the next `TableSort | null`: a new column starts `asc`, the same column goes `asc`, `desc`, off.
- `sortTableRows(rows, sort, value)` returns a stable sorted copy; `value(row, key)` gives a string or number. Numbers compare numerically, strings with `localeCompare` (numeric).
- `paginateRows(rows, page, pageSize)` returns the rows of a 1-based page; the page is clamped into range.

## Rules
- Controlled: keep `sort`, `selected`, the filters and the page in the parent; pass the already sorted, filtered and sliced `rows`.
- `caption` names the table for screen readers (it is visually hidden); always pass it.
- `columns[].cell` returns the cell content. Use `Avatar` + name, `Tag`, `StatusDot` with `label`, mono for ids and emails (`mono`). Dates are formatted by the app with `Intl.DateTimeFormat(locale)`.
- Row actions go in a last column with `width="min"` and a `Menu` or an `IconButton` with a label. Do not make a whole row a link; link the name.
- `selected` turns on the checkbox column; `rowLabel` names each row's checkbox ("Select Ada"). A selected row gets a `--bg-3` tint, never a coloured stripe.
- Bulk actions are composed by the caller in a `Toolbar` with `variant="bulk"`. Disable them while nothing is selected; do not hide them.
- `hideNarrow` columns drop when the table container is narrower than 480px; the table still scrolls inside its wrapper, never the page.
- `loading` shows one `Spinner` when there are no rows, and dims the old rows when there are some. `empty` takes an `EmptyState`: "No users yet" with a create action, or "No users match “query”" naming the query.
- Sortable headers are buttons with `aria-sort` on the `th`. Only one column is sorted at a time.
- `labels` (`DataTableLabels`: `selectAll`, `selectRow(rowLabel)`, `sortedAsc`, `sortedDesc`, `loading`) overrides the English defaults.
