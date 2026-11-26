# FormSection

Titled group of fields on a page, with an optional description and end-aligned Save and Cancel actions. Stacked in one box by default; `layout="aside"` puts the heading in a left column beside the fields.

## Anatomy
`section.x-form-section` > optional `.x-form-section-head` (`h2.x-form-section-title`, `p.x-form-section-desc`) (+ optional `.x-form-section-head-actions`) + `.x-form-section-fields[data-columns]` (a `fieldset[disabled]` when `disabled`) + optional `.x-form-section-actions`. With `layout="aside"` (`data-layout="aside"`) the head and a framed `.x-form-section-body` (fields + actions) sit in `.x-form-section-grid`.

## Rules
- `disabled` is the read-only view for a role that may see but not change the form: the fields render in a native `<fieldset disabled>` (every control in it is disabled and leaves the tab order), and `actions` are dropped. Put a `Banner` above that says why. Hide the section instead when the role may not see it at all.
- One topic per section ("Profile", "Access"); a page may hold several sections, each with its own actions.
- Fields are `Field`, `Select`, `Textarea`, `RadioGroup`, `Switch`. A field that needs the full width (a `Textarea`) goes in a section with `columns={1}`.
- `columns={2}` gives two columns only when the section is wider than 480px (container query); below that it is one column, in source order.
- Put the primary `Button` last in `actions`, after the secondary Cancel. Disable Save until the form has changes; do not hide it.
- Validate on submit, then on change for fields already marked invalid. Per-field errors go in the field's `error` prop; a failure of the whole save goes in a `Banner` above the section.
- Success is a `Toast` in past tense ("Profile saved.").
- Settings pages and other long pages of short sections use `layout="aside"`: the heading and description take the left third, so fields are not stretched across the whole row and a one-button section does not take a full-width box. Keep one layout per page. A wide table or list stays in a full-width `Card`, not in an aside section.
- `headActions` is for buttons that act on the whole section ("Add IdP", "Open allow list"); Save and Cancel stay in `actions`.

## Responsive
- `columns={2}` follows the width of the fields box (480px), not of the page.
- `layout="aside"` turns into two columns (1fr heading, 2fr fields) when the section is at least 720px wide, by container query, so it also stacks inside a narrow drawer or split pane. In two columns the heading is sticky, so it stays in view beside a tall fields box.
