# Tag

Compact mono label for facts about a session: its branch, worktree or a warning such as uncommitted work.

## Rules
- `tone="warn"` only for something the user should act on before closing or deleting.
- Mono text, so branch names and paths read exactly.
- Status of a process is a `StatusDot`, not a tag.
- `onRemove` with `removeLabel` adds a trailing remove button; the focused tag also removes on Backspace (no modifiers, not on key repeat). Use it for flags or filters the person can drop, never for a fixed fact.
