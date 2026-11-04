# SearchInput

Search box with a leading icon, a clear button, an optional shortcut hint and a match count.

## Anatomy
`div.search[data-size]` > `.search-icon`, `input.search-input[type=search]`, optional `.search-count`, then `button.search-clear` (while there is a value) or `.ws-search-hint` with a `Kbd`.

## Rules
- `size="md"` for a page-level search; `"sm"` for filters inside a panel, a toolbar or a menu.
- The placeholder says what is searched ("Find a worktree"), never just "Search".
- Pass `onClear` so a filled box can be emptied with one click; Escape-to-clear is the caller's choice.
- `shortcut` only when a global shortcut focuses this box; it hides while there is a value.
- `count` is announced with `aria-live="polite"`, so do not also announce results elsewhere.
- `labels` (`SearchInputLabels`: `search`, `clear`, `count(n)`) overrides the English defaults.
