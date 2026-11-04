# ListRow

Two-line row for lists of worktrees, agent sessions, tasks or accounts, with optional leading and trailing slots.

## Anatomy
`.x-list-row` > `.x-list-row-main` (button or div) > `.x-list-row-lead` + `.x-list-row-text` (`.x-list-row-title`, `.x-list-row-meta`); then `.x-list-row-trail`.

## Rules
- Selected is a `--bg-3` tint plus a 1px `--accent` border on all sides. Never a coloured left stripe.
- Trailing controls sit outside the main button, so they never nest buttons.
- Title is one line and truncates; meta is muted, one line, and holds secondary facts (branch, time).
- Use `as="li"` inside a `ul`; keep the list itself plain.
- Rows are 2px apart; do not add dividers between selectable rows.
