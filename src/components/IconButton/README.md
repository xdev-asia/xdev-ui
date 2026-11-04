# IconButton

Square 16px-glyph button for toolbar and header actions where a label would crowd the row.

## Rules
- `label` is required: it becomes both `aria-label` and the hover `title`.
- Icons come from `Icon` (24 grid, 1.75 stroke). Do not mix in filled glyphs.
- Use in `.ws-header`, panel toolbars and tab-strip ends. Elsewhere prefer a text `Button`.
- Hover fills with `--hover`; there is no pressed fill. Toggle state belongs to `Segmented`.
