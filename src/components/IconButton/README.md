# IconButton

Square 16px-glyph button for toolbar and header actions where a label would crowd the row.

## Rules
- `label` is required: it becomes both `aria-label` and the hover `title`.
- Icons come from `Icon` (24 grid, 1.75 stroke). Do not mix in filled glyphs.
- Use in `.ws-header`, panel toolbars and tab-strip ends. Elsewhere prefer a text `Button`.
- Hover fills with `--hover`; there is no pressed fill. Toggle state belongs to `Segmented`.
- `size`: `md` (default, 26px), `sm` (22px, dense rows), `lg` (44px, the minimum touch target; use it on touch layouts).
- `ref` is a plain prop (React 19) typed `Ref<HTMLButtonElement>`.

## Responsive
- On a touch screen (`pointer: coarse`) every size gets a 44px hit area; a mouse keeps the compact sizes.
