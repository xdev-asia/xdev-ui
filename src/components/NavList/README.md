# NavList

Vertical list of sections for a settings-style page, with the current one marked and optional counts.

## Anatomy
`nav.settings-nav` > optional `h2.settings-nav-title` + `.settings-nav-item` (button, or `a` with `href`) > optional `.settings-nav-icon` (16px `Icon`), `.settings-nav-label`, optional `.settings-nav-count`.

## Rules
- One NavList per region: the app sidebar, or the section list of a settings page. In the workspace app the app-level switch is the `ActivityBar`; a generic app or admin console uses `AppShell` with NavList.
- `icon` is optional and all-or-none within one list: give every item an icon or none.
- The current item takes `aria-current="page"`: a `--bg-3` tint and a 1px `--line` border, never a coloured stripe.
- Counts are numbers only, e.g. the settings in that section that match a search.
- Labels are nouns in sentence case ("Agents", "Keyboard").
- The nav is named by a string `title`; otherwise `labels.nav` (`NavListLabels`: `nav`) names it.
