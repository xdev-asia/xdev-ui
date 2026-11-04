# PageHeader

Title block at the top of a page: the h1, an optional description, facts beside the title and the page actions.

## Anatomy
`header.x-page-header` > optional `.x-page-crumb`, `.x-page-row` > `.x-page-heading` (`.x-page-titleline` > `h1.x-page-title` + `.x-page-meta`, `p.x-page-desc`) + `.x-page-actions`. The title uses `font: var(--type-page-title)`.

## Rules
- One `PageHeader` and so one h1 per page. Dialogs and cards use their own headings.
- Title is a noun phrase in sentence case ("Users", "Audit log") or the name of the object on a detail page.
- `meta` holds at most two facts: a `Tag` or a `StatusDot` with `label`. Never a coloured stripe.
- `actions`: at most one primary `Button`, last; secondary actions before it. Below 480px the actions wrap under the title.
- Use `breadcrumb` only when the `AppShell` top bar does not carry the `Breadcrumb`.
- Description is one sentence, no exclamation marks.
