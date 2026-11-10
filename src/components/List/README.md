# List

Plain list that holds rows (`ListRow as="li"`) or other items: no bullets, no indent, one column with a gap.

## Anatomy

`ul.x-list` (or `ol` with `ordered`) with optional `data-gap`. Items are the app's own `li` elements, usually `ListRow as="li"`.

## Rules

- Use it for any list of rows, so apps do not each reset `list-style` and padding.
- Default gap is 2px, the spacing `ListRow` asks for between selectable rows. Pass `gap={2}` (8px) when rows carry buttons and need room to breathe.
- No dividers between selectable rows; for settings use `SettingRow`, which brings its own divider.
- Give the list an `aria-label` when nothing above it names it.
- For long reading text with bullets, use `Prose` instead.
