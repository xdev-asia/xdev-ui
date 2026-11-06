# Combobox

Text box that filters a fixed list of options as you type and picks one value, or several shown as removable chips, with an optional row to create a missing option.

## Anatomy
`div.x-combobox` > `label.x-combobox-label` (unless `hideLabel`), `div.x-combobox-box` holding a `Tag` per chosen value (multiple), `input.x-combobox-input[role=combobox]` and an `IconButton.x-combobox-clear`; then the popup `div.x-combobox-list[role=listbox]` of `div.x-list-row.x-combobox-option[role=option]` (drawn like `ListRow`) and `div.x-combobox-status[aria-live=polite]` for the no-results line.

## Rules
- Use it for a list the caller already holds (tens to a few hundred options). For results a server searches, use `SearchPicker`; for a short list with no typing, use `Select` or `RadioGroup`.
- `label` is required and names both the box and the list. It is shown above the box; `hideLabel` keeps it as `aria-label` only, when a heading or a column already names the box.
- `value` is `string | null` (single) or `string[]` with `multiple`. Single closes the list after a pick; multiple keeps it open, toggles the option and shows the values as chips before the input.
- The default filter is a contains match on the label that ignores case and Vietnamese diacritics (`"da nang"` finds "Đà Nẵng"). Pass `filter` to match on `meta` or other fields; `comboboxFilter`, `foldText`, `comboboxRows` and `comboboxKey` are exported pure helpers.
- `onCreate` adds a "Create “text”" row when the text matches no option exactly. The caller adds the new option to `options` and to `value`.
- Focus stays in the input. ArrowDown and ArrowUp open the list and move the active option over enabled rows, wrapping at the ends; Home and End jump while the list is open; Enter picks; Tab closes. Escape closes the list and stops there, so it does not close a parent dialog; a second Escape empties the box (single: clears the value); a third reaches the dialog. Backspace on an empty box removes the last chip.
- A `disabled` option is shown but skipped by the arrows and ignored by Enter and click. The active option is a tint and a 1px accent border, never a coloured stripe; chosen options carry a check.
- Errors: set `invalid` and point `aria-describedby` at a `FieldMessage`.
- `labels` (`ComboboxLabels`: `noResults`, `create(text)`, `remove(label)`, `clear`) overrides the English defaults; ship `vi` strings.
