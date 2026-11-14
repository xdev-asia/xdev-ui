---
name: xdev-ui-admin
description: "Designs and builds admin and back-office screens with @xdev-asia/ui, covering both UX decisions and code: page layout with Container, Stack, Grid and the Tailwind v4 theme, dashboards, resource lists with DataTable, FacetFilter, BulkBar, reorder and Pagination, detail pages, forms in FormDialog, Drawer or a page with SaveBar and unsaved-changes guard, Combobox, DatePicker, FileDrop, ImageField crop and upload, RichTextEditor, loading, error and empty states, navigation, users and roles, settings, audit log, and a review checklist. Use when designing, building or reviewing a console, back office, dashboard, CMS or CRUD screen with @xdev-asia/ui."
license: Apache-2.0
---

# Design and build admin screens with @xdev-asia/ui

Admin users repeat the same tasks all day: design for speed, scanning and safety. Decide the UX first (what the page is for, which container, which states), then compose library parts. Check props with `xdevui_get_component`; for app setup (theme, i18n, shell) use `xdev-ui-build-app`.

## Start

```bash
npx xdev-ui-skills create admin my-admin
cd my-admin && pnpm install && pnpm dev
```

The template has sign-in, dashboard, a list, a detail with an edit form, settings and not-found over an in-memory `store.ts` and a `can(role, capability)` check. `examples/admin` in the library repository is a full console.

Existing app on Tailwind v4: import `@xdev-asia/ui/styles.css`, then `@xdev-asia/ui/tailwind.css`, after `tailwindcss` ([layout](references/layout.md)).

## Workflow

1. **Purpose.** One sentence: who uses the page and for which task. That sets the title, the primary action and what the first screen shows. Read [UX principles](references/ux-principles.md) once per project.
2. **Pick the page pattern** from the table below and read its reference.
3. **Lay out** with `AppShell` > `Container` > `Stack` / `Grid`, mobile first, and check 375, 768 and 1440px ([layout](references/layout.md), [responsive](references/responsive.md)).
4. **Pick the containers and inputs** for each form ([forms](references/forms.md)).
5. **Write the four states** of every data region: loading, error, empty, success ([states](references/states-feedback.md)).
6. **Wire navigation and permissions**: URL holds the view state, roles hide or disable ([navigation](references/navigation.md), [permissions](references/permissions.md)).
7. **Test and review**: pure functions and views tested, then [the checklist](references/review-checklist.md) and the `xdev-ui-review` skill.
8. **Look at it**: screenshots in dark and light, at 375 and 1440px, with real data ([visual identity](references/visual-identity.md)). The audit does not see a flat or unfinished screen.

## Page patterns

| page | parts | reference |
|---|---|---|
| Dashboard | `Grid` of `StatTile`, `Meter`, `Card` with `ListRow` | [dashboard](references/dashboard.md) |
| Grid of things to connect or open (providers, integrations, tools) | `SearchInput`, `Grid` of `ResourceCard` with `Emblem`, `StatusDot`, `Switch` | [visual identity](references/visual-identity.md) |
| Resource list | `SearchInput`, `FilterChip` / `FacetFilter`, `DataTable` (select, sort, reorder), `BulkBar`, `Pagination`, `EmptyState` | [resource list](references/resource-list.md) |
| Detail and edit | `PageHeader`, `Tabs`, `DescriptionList`, `FormSection`, `SaveBar` | [detail and forms](references/detail-and-forms.md) |
| Quick create, row edit, delete | `FormDialog`, `Drawer`, `Dialog alert`, `Toast` | [dialogs](references/dialogs.md) |
| Forms and inputs | `Field`, `Combobox`, `DatePicker`, `DateRangePicker`, `FileDrop`, `useUnsavedGuard` | [forms](references/forms.md) |
| Content editing | `RichTextEditor` (`/editor`), `ImageField` (`/image`) | [rich content](references/rich-content.md) |
| Users and roles | `Avatar`, `Tag`, `StatusDot`, `Checkbox` matrix | [users and roles](references/users-roles.md) |
| Settings | `NavList`, `SettingRow`, `Switch`, `Select`, `ThemeSwitch` | [settings](references/settings.md) |
| Audit log | `DateRangePicker`, `FacetFilter`, `Disclosure`, `Pagination` | [audit log](references/audit-log.md) |
| Any page on a phone or tablet | `PageHeader actions`, `Grid columns`, `DataTable sticky` / `stack`, sheet `Dialog` | [responsive](references/responsive.md) |

## Decisions that come up on every screen

| question | answer |
|---|---|
| Dialog, drawer or page? | Up to ~5 fields: `FormDialog`. Edit a row with the list in view: `Drawer`. Longer: a page with `SaveBar`. |
| Chips or facet menu? | 2 to 5 values that fit on one line: `FilterChip`. More, or tight space: `FacetFilter`. |
| Select, Combobox or SearchPicker? | Short fixed list: `Select`. Tens to hundreds held locally: `Combobox`. Server search: `SearchPicker`. |
| Confirm or undo? | Reversible: do it and offer Undo in the `Toast`. Irreversible: `Dialog alert` naming the object and count. |
| Hide or disable? | Role can never: hide. Cannot right now: disable and say why. |
| Spinner or skeleton? | First load of a region: `Skeleton` in its shape. Short wait in a control: `busy` / `Spinner`. |
| CSS or `useBreakpoint`? | Layout: CSS (`Grid columns`, `md:`). Behaviour only (drawer vs panel): `useBreakpoint`. |

## Rules

- One `PageHeader` (the only `h1`) and one primary `Button` per view; the primary is last in its row.
- Pages are a pure `XView` (props in, markup out) plus an `XPage` that loads data; tests render the view with `renderToStaticMarkup` in every state.
- Filtering, sorting, validation and CSV are pure functions with unit tests. Search, filters, sort, page and tab live in the URL.
- Never lose the user's input: errors keep the values; leaving a dirty form asks (`useUnsavedGuard`, `confirmLeave`).
- Dates are ISO `YYYY-MM-DD` strings. Uploads lock Save while busy.
- Sentence case, verbs on buttons, no emoji or exclamation marks; `en` and `vi` for every string and every component `labels`.
- Tokens only: `var(--x-space-4)`, `font: var(--type-label)`, `z-index: var(--x-z-modal)`, or the theme utilities (`bg-panel`, `text-muted`, `p-4`). No raw colours, px font sizes, Tailwind palette colours or arbitrary values.
- Finish with [the checklist](references/review-checklist.md) and the `xdev-ui-review` skill.
