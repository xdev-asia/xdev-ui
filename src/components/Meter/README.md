# Meter

Thin horizontal bar with a percentage, for context-window and rate-limit usage.

## Rules
- `value` is 0–100. At or above `warnAt` the fill and percentage switch to `--warn`.
- Always show the number; the bar alone does not carry the value.
- Group several in `.ws-meters` in the footer or session header.
