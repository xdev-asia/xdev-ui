# CommandPalette

Keyboard-first search across sessions, files and commands (Ctrl+K).

## Rules
- Filter chips narrow by kind; "All" first.
- Rows: leading StatusDot for sessions or an Icon for others, title with the match in `.pal-hit`, muted detail on the right.
- The first visible row is selected; ↑↓ move, Enter opens, Esc closes. The footer states this with `Kbd`.
- Empty result: "No matches", never a blank list.
- The bundle filters by substring for the preview; the app supplies its own ranking.
- `labels` (`CommandPaletteLabels`: `dialog`, `placeholder`, `search`, `noMatches`, `move`, `open`, `close`) overrides the English defaults.
- Host use (all optional, nothing changes without them): `open` (`false` renders nothing; a backdrop wraps the dialog and `aria-modal` is set), `onClose` (Escape or a backdrop click), `onSelect(row)` (click, or Enter on the active row), `query` + `onQueryChange` (controlled query; `defaultQuery` seeds the uncontrolled one).
- Keyboard: ↑↓ move across sections and wrap, Home/End jump, Enter selects. The active row has `aria-selected`, scrolls into view, and focus stays in the input (rows swallow `mousedown`).
- Rows take `id` (key and `data-row-id`), `hint` (shortcut text on the right, after the detail) and `disabled` (shown dimmed, skipped by the arrow keys, never selected).
- `scopes` (`{ value, label }[]`) + `scope` + `onScopeChange` render a `Segmented` row under the input (for example all, files, commands, sessions). The app filters `sections` by scope; the label of the row is `labels.scopes`.
- `emptyText` replaces "No matches"; `footer` adds content on the right of the key-hint bar.
- `filter` (`boolean | (row, query) => boolean`, default `true`): `true` keeps the case-insensitive substring test on `title`; `false` shows `sections` as given, in order, so the app can filter and rank itself (fuzzy, multi-token, accent-folded); a function replaces the test.
- Row slots: `label` (`ReactNode`) renders instead of `title`, for example to wrap fuzzy hits in `.pal-hit`; `title` stays the string for the default filter and the accessible text. `leading` renders before the icon or status dot, `meta` on the right after `hint`. All three are optional.
- `inputAddon` (`ReactNode`) renders on the right of the input, inside the same bordered row (for example a scope menu button). Without it the input renders alone. The addon owns its own keyboard and `aria` (the palette does not manage its popup).
- Pattern: `role="dialog"`, input `role="combobox"` with `aria-activedescendant`, list `role="listbox"` of `role="option"` rows.
