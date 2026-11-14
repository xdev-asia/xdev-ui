# FlowMap

A hub and the things connected to it (providers, services, agents) as cards on a grid you can pan and zoom, with the edges that carried traffic drawn in the accent.

## Anatomy
`div.x-flowmap` > `PanZoom` (`.x-flowmap-world` > `svg.x-flowmap-edges` with one `line.x-flowmap-edge` per node, `ul.x-flowmap-nodes` > `li.x-flowmap-node`, `div.x-flowmap-hub`) + `div.x-flowmap-controls` (zoom in, zoom out, fit). The panel is 480px high (`calc(var(--x-space-8) * 15)`); set `height` on it from app CSS to change it.

## Rules
- One hub, any number of nodes. One node sits straight above the hub; more go round it from the top, clockwise, in the order given. Keep the order stable (by name, or by the order the owner set) so a node does not jump between visits.
- The map fits itself to the panel (never past 150%) until the user zooms or pans; the fit button, or the `0` key, fits again. Ctrl or Cmd plus the wheel zooms; a plain wheel scrolls the page.
- `active` marks a node that carried traffic in the shown period: its border and edge take the accent and the edge moves (it stays still under reduced motion). Say the same thing in `detail` ("12 requests"); colour alone is not the state.
- Node marks are `Emblem`s (`src`, `color`, `text`). Give the hub your product mark (`BrandMark variant="tile"`) through `hub.mark`.
- It is a picture of the setup, not a way to edit it: nodes are not links or buttons. Put the list or table that says the same in numbers beside or under it.
- `labels` (`zoomIn`, `zoomOut`, `fit`, `controls`) override the English defaults.
