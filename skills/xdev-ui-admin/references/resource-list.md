# Resource list

## Contents
- Filter state
- Table
- Bulk actions
- Empty states

## Filter state
Keep `query`, `statuses`, `sort`, `page` and `pageSize` in the page; the view gets them as props. Reset `page` to 1 whenever a filter changes. Filtering is a pure function so it is unit tested:

```ts
export function filterUsers(users: User[], f: UserFilters): User[] {
  const q = f.query.trim().toLowerCase();
  return users.filter((u) => (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) && (f.statuses.size === 0 || f.statuses.has(u.status)));
}
```

Slice after sorting with `sortTableRows(rows, sort, valueOf)` and `paginateRows(rows, page, pageSize)`.

## Table

```tsx
<DataTable
  caption={t("users.table")}
  columns={columns}
  rows={rows}
  rowKey={(u) => u.id}
  rowLabel={(u) => u.name}
  sort={sort}
  onSortChange={onSortChange}
  selected={selected}
  onSelectedChange={onSelectedChange}
  loading={loading}
  empty={empty}
  labels={ui.dataTable}
/>
<Pagination page={page} pageSize={pageSize} total={sorted.length} onPageChange={onPageChange} pageSizeOptions={[10, 20, 50]} onPageSizeChange={onPageSizeChange} labels={ui.pagination} />
```

- Columns: `{ key, header, cell, sortable, mono, hideNarrow }`. Mark long columns `hideNarrow` so 360px keeps name and status.
- Show status with `StatusDot` and a label, a role with `Tag`, a person with `Avatar` and a link.
- Chips: `FilterChip` with `pressed` and `count`; count each status with the other filters applied.
- More than five values, or little room: `FacetFilter` (`label`, `options` with `count`, controlled `selected`). Keep it next to the search box.
- Manually ordered lists (menu items, banners): `reorderable` and `onReorder={(from, to) => save(moveItem(rows, from, to))}`. Reorder is off while a sort is active; reorder the full list, not one page.

## Bulk actions

```tsx
<BulkBar count={selected.size} onClear={() => setSelected(new Set())} labels={ui.bulkBar}>
  <Button variant="secondary" onClick={() => onSuspend(ids)}>{t("users.suspend")}</Button>
  <Button variant="secondary" onClick={() => askDelete(ids)}>{t("users.delete")}</Button>
</BulkBar>
```

`BulkBar` renders nothing at 0 selected. At most four secondary actions with verbs; a destructive one opens a `Dialog` that names the count. After the action clear the selection and toast. Show it only to roles that may act.

## Empty states

- No data at all: `EmptyState` with an icon, a title, a hint and the create action (secondary when the page header already has the primary one).
- Filters match nothing: title names the search text, action clears the filters.
