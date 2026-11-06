# Skeleton

Grey placeholder in the shape of content that is still loading, so the layout does not jump when data arrives.

## Anatomy
`span.x-skeleton[data-shape]` > `span.x-skeleton-bar` (aria-hidden) x lines, + `span.x-sr-only` when `announce`.

## Rules
- Use it for the first load of a region whose shape is known (a table, a card, a form). For a short wait inside a control use `Spinner`.
- Match the real content: the same number of rows and roughly the same widths. Do not show more than about eight rows.
- Set `announce` on one skeleton per region so screen readers hear "Loading" once; pass the translated word in `labels.loading`.
- The shimmer stops under `prefers-reduced-motion`.
- Replace the skeleton with the content, the error or the empty state; never leave it after a failed load.
