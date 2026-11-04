# DescriptionList

Read-only list of facts about one object: each term with its value, as a `dl`.

## Anatomy
`dl.x-dl[data-layout]` > `div.x-dl-item` > `dt.x-dl-term` + `dd.x-dl-value`.

## Rules
- Use it for the facts on a detail page (email, role, created). Editable values go in a `FormSection`.
- Terms are nouns in sentence case, no trailing colon.
- `layout="rows"` (default) puts the term left and the value right and stacks them below 480px; `layout="columns"` puts the term over the value in an auto-fit grid, for four or more short facts.
- `mono` for ids, emails and paths. Dates are formatted by the app with `Intl.DateTimeFormat(locale)`.
- An empty value shows an em dash from the caller, never an empty `dd`.
- Put it in a `Card` when it needs a title; do not nest cards.
