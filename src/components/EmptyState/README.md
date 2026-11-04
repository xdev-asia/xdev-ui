# EmptyState

Message for a list, pane or view with nothing in it yet, with a hint and an optional way to fill it.

## Anatomy
`div.x-empty[data-size]` > optional `.x-empty-icon` (center only) + `p.x-empty-title` + `p.x-empty-hint` + `.x-empty-actions`.

## Rules
- `inline` inside a pane or list: one muted line, no icon. `center` for a whole view.
- Title states what is missing ("No worktrees yet"), not an error. Errors use `Banner`.
- Hint says how to fill it in one line; actions offer that step (one primary at most).
- No illustrations or emoji; the icon tile uses `--x-color-signal-soft`.
- For "no search results", name the query in the title and offer to clear it.
