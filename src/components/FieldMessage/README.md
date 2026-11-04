# FieldMessage

One line under a form field that reports an error, a warning or a note about its value.

## Anatomy
`p.x-field-msg[data-tone]` (`.error-text` and `role="alert"` for errors).

## Rules
- Put it right under the field it describes and link it with the field's `aria-describedby` via `id`.
- Error: what is wrong and how to fix it ("Branch already exists. Pick another name."). Shown in `--danger`.
- Warn (`--warn`) for a value that works but may surprise; info (muted) for a neutral note.
- One message per field; replace it rather than stacking.
- For a whole-form or page problem use `Banner`; `Field` and `Textarea` already render their own `error` line.
