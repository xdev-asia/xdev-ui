# SwatchGroup

Row of round colour swatches for picking one colour that people see, such as the pen colour in the screenshot annotator.

## Anatomy
`div.x-swatches[role=radiogroup]` > `button.x-swatch[role=radio][data-tone]`.

## Rules
- Use it only for a colour choice that people see. A swatch is never the only way state is shown: pair state with text or a `StatusDot` label.
- At most 8 swatches. More is a different control.
- `tone` is `danger`, `warning`, `accent` or `neutral`; each maps to a design token (`--danger`, `--warn`, `--accent`, `--text-1`), never a literal.
- The selected swatch has a 2px ring in `--x-color-focus` and no check icon, so the colour stays visible.
- Every option needs a `label` ("Red"): it is the accessible name.
- One Tab stop (the selected swatch). Arrow keys move the selection, wrap at the ends and call `onChange`, as native radios do.
- `size="sm"` (24px) or `"md"` (32px); both meet the 24px target size.
- The group needs `aria-label`.

## CSS classes
`.x-swatches`, `.x-swatch`; `.x-swatches[data-size]`, `.x-swatch[data-tone]`, `.x-swatch[aria-checked="true"]`.
