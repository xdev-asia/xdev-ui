# Label

Standalone form label for a custom control that is not a `Field`, drawn exactly like the label inside `Field`.

## Anatomy
`label.x-label[for]`, then, with `required`, `span.x-label-required` > `span[aria-hidden]` (`*`) + `span.x-sr-only` (`labels.required`).

## Rules
- Use `Field`, `Select label` or `Textarea` when they fit; `Label` is for custom controls (a `Combobox`, a `SwatchGroup`, a picker button) that still need a visible label above them.
- `htmlFor` is required and must be the id of a labelable element (an `input`, `select`, `textarea` or `button`). A control that is not labelable takes `aria-labelledby` pointing at the label's `id` instead.
- Sentence case, no trailing colon, as in `Field`.
- `required` shows an asterisk and reads `labels.required` ("required" by default) after the label text; also set `required` or `aria-required` on the control itself.
- Built-in words come from `labels` with English defaults; pass `vi` strings from the app.
- `className` goes on the `label`; `ref` is a plain prop (React 19) typed `Ref<HTMLLabelElement>`.
