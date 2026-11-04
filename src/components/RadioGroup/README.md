# RadioGroup

Set of native radios for picking exactly one of a few options, such as the default shell or a run mode.

## Anatomy
`div.term-radios[role=radiogroup]` > optional `.term-radios-label` + `label.term-radio` (`input[type=radio]`, `.term-radio-text`, optional `small.term-radio-hint`).

## Rules
- Two to five options. More than five, or options that need a search, is a `Select`.
- Native radios tinted with `accent-color: var(--accent)`; arrow keys move between them through the browser.
- One option is always picked: set `value` or `defaultValue`, never leave the group empty.
- `orientation="horizontal"` for short labels on one line; `"vertical"` when options carry a `hint`.
- The group needs a name: a visible `label`, or `aria-label`.
