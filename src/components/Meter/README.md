# Meter

Thin horizontal bar with a percentage, for context-window and rate-limit usage.

## Rules
- `value` is 0–100. At or above `warnAt` the fill and percentage switch to `--warn`.
- Always show the number; the bar alone does not carry the value.
- `size="lg"` (thicker bar, mono value) is for the one progress a screen is about, such as the clip on air; use it at most once per view.
- Group several in `.ws-meters` in the footer or session header.
- `tone` sets the colour yourself (ok, warn, danger) and wins over `warnAt`. For "what is left" meters: ok above 70, warn 30–70, danger below 30.
- `fill` lets the bar take the free width of its row (quota and usage lists); the label and number keep their width.
- `valueText` replaces "NN%" after the bar and in `aria-valuetext`, for counts ("750 / 1000 left").
