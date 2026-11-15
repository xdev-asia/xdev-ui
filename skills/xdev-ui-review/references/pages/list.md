# Page check: list or table

**This page is a list when** its main content is a `DataTable`, a `List` of rows, or a `ResourceList` of records the person can filter, open or act on. A grid of cards for providers, tools or integrations is a provider grid (`provider-grid.md`).

Source rules: `xdev-ui-admin/references/resource-list.md`, `states-feedback.md`.

## Auto (audit.mjs)
- `list-empty`: a `DataTable` with no `empty`.
- `i18n-labels` (with `--i18n`): a `DataTable`, `Pagination`, `SearchInput`, `FacetFilter` or `BulkBar` with no `labels`.
- `primary-count`, `label-voice`, `icon-button-name`.

## By hand
Each line passes or fails. Note what you saw.

- [ ] **Four states.** Make the load slow: a skeleton or `DataTable loading` shows, not a blank page. Make it fail: a `Banner` with a "Try again" button shows. With no records: an `EmptyState` says what to do next. With filters that hide every row: a second empty state names the filter and offers to clear it.
- [ ] **Filters in the URL.** Set a filter or search, reload: the same rows show. Back undoes the filter.
- [ ] **Status** is a `StatusDot` with words, not colour alone and not a bare string such as `"on"`.
- [ ] **Row actions.** Each row button has a name that includes the row ("Delete Ada", not "Delete" repeated). Several actions go in a row `Menu`. The action column has a header, even a visually hidden one.
- [ ] **Bulk.** Selecting rows shows a `BulkBar` with the count. Actions that need a selection are disabled until there is one, not hidden.
- [ ] **360px.** No sideways page scroll. Secondary columns use `hideNarrow`, or the table uses `stack`. The row action stays reachable.
- [ ] **Ids and emails** use `mono`. Numbers and dates are in the active language.
- [ ] **Paging or load more** keeps the filter, and says how many rows there are.
