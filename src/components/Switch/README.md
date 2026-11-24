# Switch

On/off toggle for a setting that applies at once, such as an agent option.

## Rules
- A native checkbox with `role="switch"` and `appearance:none` (`.agent-switch`), so keyboard and forms work unchanged.
- The change takes effect immediately. If it needs a Save step, use a checkbox in a form instead.
- Labels name the setting in its "on" state ("Auto-accept edits"), never a question.
- The track is drawn 30 x 16 px; an invisible `::before` makes the hit area at least 24 x 24 px (WCAG 2.5.8).
- `hint` adds one short line under the label (`small.x-switch-hint` in `span.x-switch-field`), outside the `label` and linked by `aria-describedby`, so it is read once.
- `hideLabel` keeps the label for screen readers only (`.x-sr-only`), for a switch in a table cell whose column header already names the setting. Prefer it to a bare `aria-label`.
