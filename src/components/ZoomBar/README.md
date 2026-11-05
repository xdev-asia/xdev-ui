# ZoomBar

Zoom out, fit, zoom in and a percentage button, as one toolbar.

## Anatomy
`div.x-zoombar[role=toolbar]` > three `IconButton`s (`minus`, `maximize`, `plus`) + `button.x-zoombar-pct`.

## Rules
- `zoom` is the shown percentage; pass `null` before the content has a size and it shows a dash.
- The percentage button returns to 100% (`onActual`); the middle button fits to the view (`onFit`).
- Left/Right move focus inside the group. Labels default to English; pass `labels` for vi.
- Put it in a pane head or beside the content name; it is not a primary action.
