# Checkbox

Native checkbox with a label and optional hint, for choices that are saved with a form or a dialog's confirm.

## Anatomy
`label.ws-tick` > `input[type=checkbox]` + `.ws-tick-text` (label, optional `small.ws-tick-hint`).

## Rules
- A native `input type="checkbox"` tinted with `accent-color: var(--accent)`, so keyboard, forms and screen readers work unchanged.
- Use it when the choice waits for a Save or Confirm step. A setting that applies at once is a `Switch`.
- Label names the option in its checked state ("Delete the branch too"), sentence case, never a question.
- `indeterminate` is for a "select all" box over a partial selection; it is set on the DOM property after mount.
- The hint is one short line, linked with `aria-describedby`.
