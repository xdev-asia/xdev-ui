# ColorField

One colour token as a native swatch picker, a hex text field and a reset button, for theme editors.

## Anatomy
`div.x-colour-field` > `label.x-colour-field-name` + `input[type=color].x-colour-field-swatch` + `input.x-colour-field-hex` + `IconButton.x-colour-field-reset` + optional `small.x-colour-field-error[role=alert]`.

## Rules
- `value` is `#rrggbb`. `onChange` gets a valid lower-case `#rrggbb` only, from the swatch or from the text.
- The text accepts `#rgb` or `#rrggbb`, with or without `#`, any case (`normalizeHex`). While it is not a colour the field has `aria-invalid` and shows `labels.invalid`; nothing is committed, and on blur the text returns to `value`.
- Reset is enabled only when `overridden`.
- Every string comes from `label` and `labels` (`reset`, `picker`, `invalid`); the component has no text of its own.
- `data-*` attributes and `className` reach the root. `id` names the hex field.
- Swatch and text on one row; under 420px the text and reset move to a second row, and the error spans the row.

## CSS classes
`.x-colour-field`, `.x-colour-field-name`, `.x-colour-field-swatch`, `.x-colour-field-hex`, `.x-colour-field-reset`, `.x-colour-field-error`.
