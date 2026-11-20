# Tag

Compact mono label for facts about a session: its branch, worktree or a warning such as uncommitted work.

## Rules
- `tone="warn"` only for something the user should act on before closing or deleting.
- Mono text, so branch names and paths read exactly.
- Status of a process is a `StatusDot`, not a tag.
- `onRemove` with `removeLabel` adds a trailing remove button; the focused tag also removes on Backspace (no modifiers, not on key repeat). Use it for flags or filters the person can drop, never for a fixed fact.
- `swatch` takes a CSS colour and draws a small round dot (the size of a `StatusDot`) before the text, for a category or label whose colour is data, such as a colour the person picked. The text carries the meaning; the dot is decoration (`aria-hidden`) and is never the only cue. Never a stripe or a coloured border. The colour is set through the React `style` prop, which a client render applies through the CSSOM, never through a stylesheet built from the value.
