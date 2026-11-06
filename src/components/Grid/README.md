# Grid

CSS grid with column counts per breakpoint (mobile first), or auto-fill cells of a minimum width; `GridItem` spans columns.

## Anatomy
`div.x-grid[data-gap]` with inline `--x-grid-cols[-bp]` or `--x-grid-min`; `div.x-grid-scope` around it when `responsive="container"`. Children may be `div.x-grid-item` with `--x-span[-bp]` or `data-full`.

## Rules
- Breakpoints are sm 640, md 768, lg 1024, xl 1280, 2xl 1536 (`BREAKPOINTS`). A key applies from its width up and falls back to the next smaller key that is set.
- Start at one column on phones: `columns={{ base: 1, md: 2, xl: 4 }}`.
- For cards of a natural width, use `minItemWidth="16rem"` and let the grid choose the count.
- Inside a panel, a split pane or a `Drawer`, set `responsive="container"` so the columns follow the space the grid has, not the window.
- A `GridItem` span never exceeds the current column count. `span="full"` takes the whole row (a section title, a banner).
- Lay out with CSS. `useBreakpoint()` is only for behaviour CSS cannot express (a Drawer instead of a side panel); it renders "base" on the server and the first client pass.
