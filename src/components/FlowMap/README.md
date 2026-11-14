# FlowMap

A hub and the things connected to it (providers, services, agents) as cards on a grid you can pan and zoom, with the edges that carried traffic drawn in colour and moving. Give it `sources` too and it reads left to right, callers to hub to providers, like a router.

## Anatomy
`div.x-flowmap` > `PanZoom` (`.x-flowmap-world` > `svg.x-flowmap-edges` with one `g[data-side][data-tone]` per node holding `path.x-flowmap-glow` (active only) and `path.x-flowmap-edge`, `ul.x-flowmap-nodes[data-side]` > `li.x-flowmap-node[data-tone]` for the sources and again for the nodes, `div.x-flowmap-hub`) + `div.x-flowmap-controls` (zoom in, zoom out, fit). The panel is 480px high (`calc(var(--x-space-8) * 15)`); set `height` on it from app CSS to change it.

## Rules
- Without `sources`: one hub, any number of nodes. One node sits straight above the hub; more go round it from the top, clockwise, in the order given. Keep the order stable (by name, or by the order the owner set) so a node does not jump between visits.
- With `sources`: sources in a column on the left, nodes in a column on the right, joined to the hub by S-curves. In edges take the accent and out edges `--orange`, as the mark's two blades do. Use it when you know who sent the traffic (callers, apps, keys); more than about ten a side is a table, so fold the rest into one "N others" node.
- `weight` (0 to 1, a node's share of the traffic) sets its edge's width; `tone` (`warn`, `danger`) turns its border and edge amber or red for failures. Say both in `detail` too ("120 requests, 6 failed").
- The map fits itself to the panel (never past 150%) until the user zooms or pans; the fit button, or the `0` key, fits again. Ctrl or Cmd plus the wheel zooms; a plain wheel scrolls the page.
- `active` marks a node that carried traffic in the shown period: its border and edge take colour, a soft track lies under the edge and dots move along it (they stay still under reduced motion). A node without traffic has a quiet name. Say the same thing in `detail` ("12 requests"); colour alone is not the state.
- Node marks are `Emblem`s (`src`, `color`, `text`). Give the hub your product mark (`BrandMark variant="tile"`) through `hub.mark`.
- It is a picture of the setup, not a way to edit it: nodes are not links or buttons. Put the list or table that says the same in numbers beside or under it.
- `labels` (`zoomIn`, `zoomOut`, `fit`, `controls`) override the English defaults.
