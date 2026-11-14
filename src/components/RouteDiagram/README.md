# RouteDiagram

A small, still picture of a router: what sends traffic in on the left, the hub in the middle, where it goes out on the right. For a gateway's endpoint page or an empty state; use `FlowMap` for a live map of many nodes.

## Anatomy
`figure.x-route` (a size container) > `div.x-route-body` > `ul.x-route-side[data-side="in"]` > `li.x-route-node` (`Icon` + `.x-route-label` + `.x-route-detail`), `span.x-route-line[data-side="in"]`, `div.x-route-hub` (`.x-route-hub-mark` + `.x-route-hub-name`), `span.x-route-line[data-side="out"]`, `ul.x-route-side[data-side="out"]`.

## Rules
- Two to four nodes a side. More than that is a list, not a picture.
- The in line is the accent, the out line `--orange`, as the mark's two blades are; nothing else in it is coloured.
- Give the hub your product mark (`BrandMark variant="tile"`) through `hub.mark`.
- It is a picture, not a control: nodes are not links or buttons. `label` names the figure; every node says itself in words.
- Below 480px of container width it stacks: in, hub, out, with the lines turned upright.
