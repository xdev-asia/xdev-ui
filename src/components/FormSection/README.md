# FormSection

Titled group of fields on a page, with an optional description and end-aligned Save and Cancel actions.

## Anatomy
`section.x-form-section` > optional `.x-form-section-head` (`h2.x-form-section-title`, `p.x-form-section-desc`) + `.x-form-section-fields[data-columns]` + optional `.x-form-section-actions`.

## Rules
- One topic per section ("Profile", "Access"); a page may hold several sections, each with its own actions.
- Fields are `Field`, `Select`, `Textarea`, `RadioGroup`, `Switch`. A field that needs the full width (a `Textarea`) goes in a section with `columns={1}`.
- `columns={2}` gives two columns only when the section is wider than 480px (container query); below that it is one column, in source order.
- Put the primary `Button` last in `actions`, after the secondary Cancel. Disable Save until the form has changes; do not hide it.
- Validate on submit, then on change for fields already marked invalid. Per-field errors go in the field's `error` prop; a failure of the whole save goes in a `Banner` above the section.
- Success is a `Toast` in past tense ("Profile saved.").
