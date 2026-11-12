# Screen recipes

The design decisions for each kind of screen. For the build details of console screens, open the matching `xdev-ui-admin` reference.

## Contents
- Frames
- Dashboard
- Collection of things (cards)
- Resource list (table)
- Detail
- Form and settings
- Sign-in
- Empty first run

## Frames

| app kind | frame | container |
|---|---|---|
| console, back office, tool | `AppShell`: sidebar nav, header with page title and actions | `Container size="xl"` per page |
| public site, docs | `SiteShell`: top links, footer | `size="lg"` or `"xl"` |
| settings area | `SettingsShell` inside the app frame | `size="md"` |

The header holds, from left: the brand (in the sidebar), the page title, then search for the current page, `ThemeSwitch`, language, and the account `Menu`. Keep it one line at 1440px; at 360px actions collapse into the menu.

## Dashboard
- `PageHeader` with the time range control in `actions`.
- A row of `StatTile` (label, value in `--type-stat`, delta with `deltaTone`), then one or two charts or `Heatmap`, then a short list of recent items.
- Four tiles at most in a row; each tile answers one question. No decorative charts.
- Build: `references/dashboard.md` in `xdev-ui-admin`.

## Collection of things (cards)
Providers, integrations, models, apps: things people recognise by their face.
- `Grid minItemWidth="15rem"` of `ResourceCard`, each with an `Emblem` in `leading`, the name as `title`, a `StatusDot` with words in `status`, a `Switch` or menu in `trailing`.
- A heading and a count above each group; group by kind when there are more than about 12.
- Search in the header filters the grid; an empty result names the query.
- A switched-off thing is `dimmed`. See `references/visual-identity.md` in `xdev-ui-admin`.

## Resource list (table)
Things people compare by their fields: keys, users, requests, logs.
- `DataTable` with sortable columns, `FacetFilter` above it, `BulkBar` when rows are selected, `Pagination` below.
- IDs, keys and numbers in mono; numbers right-aligned; dates through `Intl.DateTimeFormat`.
- Row actions in a trailing `Menu`; the row itself opens the detail.
- Build: `references/resource-list.md` in `xdev-ui-admin`.

## Detail
- `PageHeader` with `breadcrumb`, the object's `Emblem` or `Identity`, status in `meta`, actions on the right (one primary).
- `DescriptionList` for fields, `Card` per section, `Tabs` only when sections are long and independent.
- Build: `references/detail-and-forms.md` in `xdev-ui-admin`.

## Form and settings
- Short create or edit: `FormDialog`. Long or many sections: a page in `Container size="md"` with `FormSection` and `SaveBar`.
- Settings are `SettingRow` lines: the label and its help on the left, the control on the right.
- Build: `references/forms.md` in `xdev-ui-admin`, `references/settings.md` in `xdev-ui-admin`.

## Sign-in
- Centred, narrow (`Container size="sm"`), on `--bg-0`. `BrandMark` at 64px, the product name, one form, one primary button.
- Errors under the field in words; no shake animation.

## Empty first run
- `EmptyState` with `size="center"`, an icon, a title that says what this place is for, a hint, and the first action as the only primary button. Use `steps` when setup takes several steps.
- Build: `references/states-feedback.md` in `xdev-ui-admin`.
