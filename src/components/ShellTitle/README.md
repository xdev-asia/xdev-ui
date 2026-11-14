# ShellTitle

Page title for the `AppShell` top bar (its `title` slot): the page's icon (24px, accent, no tile) beside the h1 (`--type-shell-title`), and a one-line description on the line under both, or a link back to the parent list on a detail page.

## Anatomy
`div.x-shell-title` (or `nav.x-shell-title` with a `parent`) > optional `a.x-shell-title-parent` + `.x-shell-title-sep`, `.x-shell-title-body` > `.x-shell-title-row` (optional `span.x-shell-title-icon` with `aria-hidden`, then `h1.x-shell-title-text`) + optional `p.x-shell-title-desc`.

## Rules
- One per page, in `AppShell` `title`; it is the page's only h1. Do not also render a `PageHeader` title.
- `icon` is the same `IconName` the page has in the sidebar. On a detail page pass the item's logo or `Emblem` as `media` and the list as `parent` ("Providers › OpenAI").
- The description is one sentence and shows from 1024px up; keep the title short enough to fit a phone top bar.
- With a `parent` the wrapper is a `nav` named "<parent> / <title>"; pass `labels.trail` when the title is not plain text or for another language.
- Page actions (buttons, filters) stay in the page content; search for the page may go in `AppShell` `actions`.
