# Prose

Wrapper for long reading text, such as privacy and terms pages, help articles and release notes: it styles the plain HTML inside it.

## Anatomy

`article.x-prose` (any element through `as`) styling its `h1`, `h2`, `h3`, `p`, `ul`, `ol`, `li`, `a`, `code` and `strong` children.

## Rules

- Write plain HTML inside; do not put components with their own layout (cards, tables) in it.
- One `h1` per page. Sections are `h2`; go no deeper than `h3`.
- The line length is capped at about 70 characters for reading; put it inside a `Container size="md"`.
- Body text is muted and wraps long words and URLs, so nothing scrolls sideways at 360px.
- For a list of rows (sessions, devices) use `List` with `ListRow`, not a bulleted list.
