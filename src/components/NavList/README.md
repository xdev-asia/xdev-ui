# NavList

Vertical list of sections for a settings-style page, with the current one marked and optional counts.

## Anatomy
`nav.settings-nav` > optional `h2.settings-nav-title` + `.settings-nav-item` (button, or `a` with `href`) > `.settings-nav-label`, optional `.settings-nav-count`.

## Rules
- One list per page, at the left of the content it switches. App-level switching is the `ActivityBar`.
- The current item takes `aria-current="page"`: a `--bg-3` tint and a 1px `--line` border, never a coloured stripe.
- Counts are numbers only, e.g. the settings in that section that match a search.
- Labels are nouns in sentence case ("Agents", "Keyboard").
- The nav is named by a string `title`; otherwise `labels.nav` (`NavListLabels`: `nav`) names it.
