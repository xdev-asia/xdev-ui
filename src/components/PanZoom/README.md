# PanZoom

A viewport that scales and moves its content: Ctrl or Cmd plus the wheel zooms at the cursor, a drag pans.

## Anatomy
`div.x-panzoom[role=group][tabindex=0]` > `div.x-panzoom-content` (the transform).

## Rules
- The caller owns `zoom`, `x` and `y`; `onZoom` receives the whole next state, `onPan` the next `x` and `y`.
- Keys `+`, `-` zoom around the centre and `0` resets to zoom 1 at 0, 0. A plain wheel is left to the page.
- Zoom range is 0.25 to 8 (`clampZoom`); step is x1.25. Use `fitScale`, `zoomAt` and `percentOf` from the same package for the math.
- Give it a size (a flex child or a fixed height); it clips its content.
- `label` names the viewport for screen readers. Pair it with a `ZoomBar` so zoom does not depend on a wheel.
