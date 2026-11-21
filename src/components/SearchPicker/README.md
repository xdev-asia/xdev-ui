# SearchPicker

Search box with a list of matches under it, for picking one thing out of a result set that the caller searches (issues, pull requests, branches).

## Anatomy
`div.x-search-picker` > a `SearchInput` with `role="combobox"`, `div.x-search-picker-list[role=listbox]` of `div.x-list-row.x-search-picker-option[role=option]` (drawn like `ListRow`), then `div.x-search-picker-status[aria-live=polite]`.

## Rules
- The caller owns the query and the results: set `items` from `value` (debounce the request) and pass a `status` line while loading, when nothing matched or when the search failed.
- Focus stays in the input. Arrow keys move the active option and `aria-activedescendant` follows; Enter calls `onPick`; Escape clears a non-empty query and stops there, so it does not close a parent dialog; Escape on an empty box reaches the dialog.
- A `disabled` item is shown but skipped by the arrows and ignored by Enter and click. The active option is a tint and a 1px accent border, never a coloured stripe.
- `label` names both the box and the list; it is required. `placeholder` says what is searched.
- In a form next to labelled fields, pass `showLabel`: the label is drawn above the box as a real `<label for>` (like `Field` and `Combobox`) instead of an `aria-label` only. Leave it off where a heading or the dialog title already names the search.
- Use `ListRow` for a plain list with no search box, and `Select` for a short fixed list.
- `labels` (`SearchPickerLabels`: `clear`) overrides the English default.
