# FacetFilter

Chip-style trigger that opens a popover with a searchable checkbox list, for filtering a list by one facet with many values (status, role, tag). The trigger shows the facet name and how many values are picked.

## Anatomy
`span.x-popover-anchor` > `button.task-chip.x-facet-trigger[aria-haspopup=dialog][data-active]` (`.task-chip-label`, `.task-chip-count`, chevron) + `div.x-popover.x-facet[role=dialog]` > optional `SearchInput` (`size="sm"`), `ul.x-facet-list` of `Checkbox` (label + `.x-facet-count`) or `p.x-facet-empty`, and `div.x-facet-foot` with a secondary Clear `Button`.

## Helpers (exported from the package)
- `filterFacetOptions(options, query)` returns the options whose label contains the query, ignoring case, spaces around it and Vietnamese diacritics (`foldText`).
- `toggleFacetValue(selected, value, options)` adds or removes a value and returns the selection in option order; values that are not options stay at the end.

## Rules
- Controlled: keep `selected` in the parent, filter the rows there and reset to page 1 when it changes.
- `label` is the facet in sentence case ("Status", "Role"); it names both the trigger and the panel. Do not repeat the picked values in the trigger; the count says how many.
- `count` on each option is the number of matches with the other filters applied, like `FilterChip`.
- For two to five values that all fit on one line, a row of `FilterChip`s is quicker; use `FacetFilter` when there are more, or when space is short.
- The search field appears by itself past seven options; force it with `searchable`. "No options match" (`labels.noResults`) shows when the search finds nothing.
- Picked is a tint and a 1px accent border on the trigger, never a solid fill.
- `labels` (`FacetFilterLabels`: `search`, `clearSearch`, `clear`, `noResults`, `selected(count)`) overrides the English defaults.
