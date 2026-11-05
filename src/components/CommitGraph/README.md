# CommitGraph

The graph cell of one commit row: the lanes that pass through and the commit's node. The history list stacks one per row.

## Anatomy
`svg.x-commit-graph[data-kind]` (`aria-hidden`) holding one `path` per lane segment and one node. Rows come from the pure `graphRows(items, refs)`; `laneLinks(row)` says which lane goes where.

## Rules
- Row height 24, lane width 11, curve radius 5, 1px round-cap strokes. Width is `11 * (max(in, out, 1) + 1)`.
- Node radius 3.5. A merge is a 4.5 ring with a `--bg-1` centre. HEAD is 6.5 with a 1.5 `--bg-1` stroke. A boundary (incoming or outgoing changes, `boundary: true` on the item) has a dashed `4 2` ring.
- Colours come only from `--x-graph-head`, `--x-graph-remote`, `--x-graph-base` and `--x-graph-lane-1..5`. Lanes that follow no ref rotate through the five lane colours; the counter restarts on every `graphRows` call.
- The graph is decoration: the row carries the label (subject, refs), so the SVG stays `aria-hidden`.
- There is no lane cap; a wide graph scrolls with its row.
