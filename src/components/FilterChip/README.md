# FilterChip

Toggle chip that turns one filter on or off, with an optional match count.

## Anatomy
`button.task-chip[aria-pressed]` > `.task-chip-label` + optional `.task-chip-count` (mono).

## Rules
- Put chips in a row (`.task-chips`) above the list they filter; each chip is independent (multi-select).
- For exactly one of a few views use `Segmented` or `Tabs` instead.
- Pressed is a tint and a 1px accent border, never a solid fill or a left stripe.
- Labels are the state or kind being filtered ("Failed", "Waiting"), sentence case. The count is the number of matches with that filter alone.
