# Porting another product's UI to xDev

A port keeps what the other product got right (what is on each page, in what order, how people move between pages) and replaces how it looks with xDev. The result must read as an xDev product, not a copy with a new logo.

## Contents
- Steps
- What to keep, what to replace
- Mapping table
- When the library lacks a part

## Steps
1. **Inventory.** Screenshot each page of the source at 1440px. List per page: the regions, the components, the actions, the states you can see.
2. **Map.** For each source part, pick the library part from the table below. Note every part with no match.
3. **Fill the gaps in xdev-ui**, not in the app (see the last section).
4. **Build** each page from the screen recipes in `screens.md`, keeping the source's region order.
5. **Strings.** Rewrite labels in xDev voice (sentence case, verbs on buttons) in `en` and `vi`; do not copy the source's text.
6. **Compare.** For a 1:1 port, measure both apps (see owner-notes.md, linked from SKILL.md). Put source and port screenshots side by side, dark and light, 1440px and 360px. List each difference and decide: keep (xDev rule wins) or fix.

## What to keep, what to replace

| keep from the source | replace with xDev |
|---|---|
| page list and navigation order | colours, fonts, radii, shadows |
| regions on each page and their order | the logo and product name (`BrandMark`) |
| which fields and actions exist | icons (library set only) |
| density (how much fits on a screen) | state styling (dots, tints, `Badge`) |
| the flow of multi-step tasks | copy and labels |

Never copy the source's logo, illustrations, colour palette or wording. Third-party logos that name a provider stay in that provider's `Emblem`.

## Mapping table

| source pattern | xDev part |
|---|---|
| sidebar with icon + label items | `AppShell` `nav` with `NavList` |
| top bar with title and actions | `AppShell` header (title via the shell, actions in `actions` as icon buttons, `MenuButton` with `variant="icon"` for menus) |
| page title with buttons | `PageHeader` |
| logo tiles or provider cards | `ResourceCard` with `Emblem` |
| key-value list | `DescriptionList` |
| data grid | `DataTable` with `Pagination` |
| filter pills | `FacetFilter` or `FilterChip` |
| toggle | `Switch` |
| pill tabs or button group | `Segmented` (a mode) or `Tabs` (sections) |
| modal form | `FormDialog` |
| side sheet | `Drawer` |
| status pill | `StatusDot` with `label`, or `Badge` |
| usage bar | `Meter` or `UsageMeterRow` |
| numbers card | `StatTile` |
| toast | `Toast` |
| inline alert | `Banner` |
| code or key display | `CodeBlock` or mono text with a copy `IconButton` |

## When the library lacks a part
- A new component, or a change to an existing one, goes into xdev-ui first (with its story, test, README and both themes), then the app upgrades the package.
- Until it ships, keep the app on the closest library part. Do not build a private look-alike with app CSS.
- App CSS only places parts: grid areas, gaps, widths. If you are writing colours or borders in app CSS, the part belongs in the library.
