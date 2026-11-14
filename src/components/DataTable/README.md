# DataTable

Controlled table for lists of records: sortable headers, optional row selection, optional row reorder, loading and empty states. It renders; the caller sorts, filters, paginates and reorders.

## Anatomy
`div.x-table-wrap` (scrolls on x inside itself) > `table.x-table` > `caption.x-sr-only`, `thead` (`th[aria-sort]` with `button.x-table-sort`, `th.x-table-check` with a `Checkbox`) and `tbody` (`tr[aria-selected]`, `td`, or `td.x-table-empty` for the empty and loading rows). With `reorderable`, a leading `td.x-table-handle-cell` holds `button.x-table-handle`, rows carry `data-lifted`, `data-dragging` and `data-drop="before|after"` (the drop line), and a visually hidden `[aria-live=polite]` status follows the table.

## Helpers (exported from the package)
- `nextTableSort(current, key)` returns the next `TableSort | null`: a new column starts `asc`, the same column goes `asc`, `desc`, off.
- `sortTableRows(rows, sort, value)` returns a stable sorted copy; `value(row, key)` gives a string or number. Numbers compare numerically, strings with `localeCompare` (numeric).
- `paginateRows(rows, page, pageSize)` returns the rows of a 1-based page; the page is clamped into range.
- `moveItem(array, from, to)` returns a copy with one item moved (`to` clamped); use it in `onReorder`.
- `reorderKeyStep(state, key, index, count)` is the keyboard reorder reducer: it returns the next lift state, the event to announce (`lift`, `move`, `drop`, `cancel`) and whether the key was handled. `reorderSlot(y, mids)` and `slotToIndex(from, slot)` map a pointer position to the drop index.

## Rules
- Controlled: keep `sort`, `selected`, the filters and the page in the parent; pass the already sorted, filtered and sliced `rows`.
- `caption` names the table for screen readers (it is visually hidden); always pass it.
- `columns[].cell` returns the cell content. Use `Avatar` + name, `Tag`, `StatusDot` with `label`, mono for ids and emails (`mono`). Dates are formatted by the app with `Intl.DateTimeFormat(locale)`.
- Row actions go in a last column with `width="min"` and a `Menu` or an `IconButton` with a label. Do not make a whole row a link; link the name.
- `selected` turns on the checkbox column; `rowLabel` names each row's checkbox ("Select Ada"). A selected row gets a `--bg-3` tint, never a coloured stripe.
- Bulk actions go in a `BulkBar` (shown only while rows are selected) or a `Toolbar` with `variant="bulk"` (always shown; disable its actions while nothing is selected).
- `hideNarrow` columns drop when the table container is narrower than 480px; the table still scrolls inside its wrapper, never the page.
- `loading` shows one `Spinner` when there are no rows, and dims the old rows when there are some. `empty` takes an `EmptyState`: "No users yet" with a create action, or "No users match “query”" naming the query.
- Sortable headers are buttons with `aria-sort` on the `th`. Only one column is sorted at a time.
- `reorderable` adds a leading drag handle per row, named `labels.reorderHandle(rowLabel)`. Pointer: drag the handle; a 2px accent line shows where the row lands. Keyboard: Space or Enter lifts the row, ArrowUp/ArrowDown (Home/End) move it, Space or Enter drops it, Escape cancels; each step is announced politely. `onReorder(fromIndex, toIndex)` gets indexes into `rows`; apply them with `moveItem` and save the order.
- Reorder is disabled while a sort is active (`sort` set), while `loading`, and with fewer than two rows: the handles stay in place, disabled. A manual order and a sorted view do not mix; clear the sort to reorder. Reorder the full list, not one page of it, or map the page indexes back yourself.
- `labels` (`DataTableLabels`: `selectAll`, `selectRow(rowLabel)`, `sortedAsc`, `sortedDesc`, `loading`, `reorderColumn`, `reorderHandle(rowLabel)`, `lifted(rowLabel)`, `moved(pos, total)`, `dropped(pos, total)`, `cancelled`) overrides the English defaults.

## Responsive
- The table scrolls inside `.x-table-wrap`, never the page. The select column stays pinned at the start while it scrolls.
- `columns[].sticky` (`"start"` or `"end"`) pins a column the same way; use `sticky="end"` on the row-actions column so the actions stay in view on a phone.
- `stack` turns each row into a card of "label: value" lines when the table container is under 480px (a container query, so it also works in a narrow panel). Each cell takes its label from `columns[].label`, or from `header` when that is a string. Sort headers are hidden in stack mode, so offer sorting elsewhere (a `Select`) when it matters on a phone.
- With `stack` the table gets explicit `table`, `rowgroup`, `row`, `columnheader` and `cell` roles, because `display: block` drops the native table semantics in some browsers.
