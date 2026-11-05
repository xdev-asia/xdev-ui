# PanZoom

A viewport that scales and moves its content: Ctrl or Cmd plus the wheel zooms at the cursor, a drag pans.

## Anatomy
`div.x-panzoom[role=group][tabindex=0]` > `div.x-panzoom-content` (the transform).

## Rules
- The caller owns `zoom`, `x` and `y`; `onZoom` receives the whole next state, `onPan` the next `x` and `y`.
- Keys `+`, `-` zoom around the centre and `0` resets to zoom 1 at 0, 0. A plain wheel is left to the page; the Ctrl or Cmd wheel listener is non-passive, so the browser page does not zoom with it.
- Zoom range is 0.25 to 8 by default (`clampZoom`); step is x1.25. Pass `min` and `max` (absolute zoom, also the last arguments of `zoomAt` and `stepZoom`) when `zoom` 1 means a fit scale: with an image that fits at 0.1, `min={0.25}` would make zoom out jump to 0.25, which is zoom in. Use `fitScale`, `zoomAt` and `percentOf` from the same package for the math.
- Give it a size (a flex child or a fixed height); it clips its content.
- `label` names the viewport for screen readers. Pair it with a `ZoomBar` so zoom does not depend on a wheel.
