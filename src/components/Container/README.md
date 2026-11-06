# Container

Centres page content and caps its width at a `--x-container-*` size, with a 16px gutter so text never touches the screen edge.

## Anatomy
`div.x-container[data-size]` (any element through `as`).

## Rules
- One Container per page region, around the content of `<main>`; do not nest them.
- Pick the size for the content: `md` (768px) for forms and reading, `xl` (1280px, default) for lists and dashboards, `full` for wide tables and editors.
- Keep the gutter unless the parent already pads (for example inside a `Card`).
- In Tailwind apps the same widths are `max-w-(--x-container-lg)`; prefer the component so the gutter stays the same.
