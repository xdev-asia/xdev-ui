# IconButton

Square 16px-glyph button for toolbar and header actions where a label would crowd the row.

## Rules
- `label` is required: it becomes both `aria-label` and the hover `title`.
- Icons come from `Icon` (24 grid, 1.75 stroke). Do not mix in filled glyphs.
- Use in `.ws-header`, panel toolbars and tab-strip ends. Elsewhere prefer a text `Button`.
- Hover fills with `--hover`; there is no pressed fill. Toggle state belongs to `Segmented`.
- `size`: `md` (default, 26px), `sm` (22px, dense rows), `lg` (44px, the minimum touch target; use it on touch layouts).
- `ref` is a plain prop (React 19) typed `Ref<HTMLButtonElement>`.
- `busy` is for an async action started from the icon (save a row, regenerate): one click, then `busy` until it settles.
  A `Spinner` replaces the icon, `aria-busy="true"` is set and the button is disabled; `label` stays the accessible name.
- `tone="danger"` marks a destructive icon-only action (delete a row): `--x-color-danger` glyph, `--x-color-danger-soft`
  hover, the usual focus ring. When the action cannot be undone it still opens a confirming `Dialog` (`alert`, named
  object, `danger` confirm last), exactly as a text button would.

## Responsive
- On a touch screen (`pointer: coarse`) every size gets a 44px hit area; a mouse keeps the compact sizes.
