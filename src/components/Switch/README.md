# Switch

On/off toggle for a setting that applies at once, such as an agent option.

## Rules
- A native checkbox with `role="switch"` and `appearance:none` (`.agent-switch`), so keyboard and forms work unchanged.
- The change takes effect immediately. If it needs a Save step, use a checkbox in a form instead.
- Labels name the setting in its "on" state ("Auto-accept edits"), never a question.
- The track is drawn 30 x 16 px; an invisible `::before` makes the hit area at least 24 x 24 px (WCAG 2.5.8).
