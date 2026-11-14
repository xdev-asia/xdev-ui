# Segmented

Two to four mutually exclusive options shown together, such as a diff view mode or the theme.

## Rules
- Each segment is a `<button aria-pressed>`; the group carries `role="group"` and an `aria-label`.
- Pressed segment: `--x-color-accent` fill with `--x-color-on-accent` text.
- More than four options, or options with long labels: use `Select`.
- Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`.
- `disabled` greys out every segment (for example while a save is under way).
- Each option may carry `count`, a small number shown after the label in `.segmented-count` (muted; 0 is shown). It is part of the button's accessible name, so keep the label short.

## Responsive
- Below 768px the control scrolls sideways inside itself when the options do not fit. Past four options, use `Select`.
