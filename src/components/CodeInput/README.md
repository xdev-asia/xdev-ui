# CodeInput

Entry for a short code that someone reads off another screen, such as a pairing code of 10 characters or a check code of 6 digits.

## Anatomy
`div.x-code-input` > `div.x-code-cells[aria-hidden]` (`span.x-code-group` > `span.x-code-cell`) + one real `input.x-code-field`.

## Rules
- Always pair it with a visible label (a `Field` label or a heading). `label` is the accessible name of the input, not a replacement.
- Show a code, not a password: the characters stay visible. Never use it for secrets that must be hidden.
- One `<input>`, not one per character, so paste, IME, password managers and screen readers behave. The cells are a drawing.
- `onChange` always gets the normalised code: upper case, no spaces or dashes, cut to `length`. Pasting `7K4QM-2XD9P` and typing `7k4qm2xd9p` give `7K4QM2XD9P`.
- `alphabet="crockford"` (default) maps `O` to `0` and `I` or `L` to `1` and drops other characters such as `U`. `"digits"` accepts 0 to 9 only and shows a numeric keypad.
- `onComplete` is called once each time the code reaches `length`.
- `invalid` gives each cell a 1px `--x-color-danger` border and `aria-invalid`; say why in a `FieldMessage` next to it.
- Focus draws a 2px `--x-color-focus` ring around the group. Cells shrink to fit 360px.

## CSS classes
`.x-code-input`, `.x-code-cells`, `.x-code-group`, `.x-code-cell`, `.x-code-field`; `.x-code-input[data-invalid]`, `.x-code-input[data-disabled]`, `.x-code-cell[data-filled]`, `.x-code-cell[data-next]`.
