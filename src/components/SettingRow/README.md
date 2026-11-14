# SettingRow

One setting on a settings page: name and description on the left, its control on the right.

## Anatomy
`div.settings-item` > `.settings-item-text` (`label|span.settings-label`, `p.settings-hint`) + `.settings-item-control`.

## Rules
- Label in sentence case, stating the thing set ("Restore sessions on launch"), not a question.
- Description: one or two lines on the effect; no "Enable this to...".
- Pass `controlId` when the control is a form element, and give that element `aria-describedby="<controlId>-hint"`.
- Rows stack in a list with a 1px `--x-color-line` divider between them; do not wrap each in a Card.
- `flash` highlights the row after a jump from settings search: an overlay fading out by opacity, none under reduced motion.
- Give every row an `id` so search results can scroll to it.

## Responsive
- The control moves under the label when the row is narrower than the label needs (about 12rem).
