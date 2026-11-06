# Stack

Lays children out in one column or one row with a gap from the space scale, the replacement for margin utilities between siblings.

## Anatomy
`div.x-stack[data-direction][data-gap]` with optional `data-align`, `data-justify`, `data-wrap`.

## Rules
- Use `gap` (1, 2, 3, 4, 6, 8 = 4 to 32px) instead of margins on the children.
- A row wraps by default so it still fits at 360px; turn `wrap` off only for a row that must stay on one line (an icon and a label).
- Action rows: `direction="row" justify="end"`, secondary button first, primary last.
- For two dimensions use `Grid`, not nested Stacks.
