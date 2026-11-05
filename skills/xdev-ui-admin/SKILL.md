---
name: xdev-ui-admin
description: "Builds admin and back-office screens with @xdev-asia/ui: dashboard with StatTile and Meter, resource lists with DataTable, SearchInput, FilterChip, sorting, Pagination, row selection and bulk actions, detail pages with DescriptionList, edit forms with FormSection and Field validation, create and delete dialogs, users, roles and a permissions matrix, settings pages with SettingRow, and an audit log. Use when the task is a console, back office, dashboard or CRUD screen built with @xdev-asia/ui."
license: Apache-2.0
---

# Build admin screens with @xdev-asia/ui

Start from `templates/admin`, copy the page recipe you need, and check props with `xdevui_get_component`. For app-wide setup (theme, i18n, shell) use the `xdev-ui-build-app` skill.

## Start

```bash
npx xdev-ui-skills create admin my-admin
cd my-admin && pnpm install && pnpm dev
```

The template has sign-in, dashboard, an items list, an item detail with an edit form, settings and not-found, over an in-memory `store.ts` and a `can(role, capability)` check. Replace `Item` with your resource. A full console (users, roles matrix, audit log, dialogs) is `examples/admin` in the library repository; the references below show its pages.

## Page recipes

| page | parts | reference |
|---|---|---|
| Dashboard | `PageHeader`, `StatTile` x4, `Meter`, `Card` with `ListRow` | [dashboard](references/dashboard.md) |
| Resource list | `SearchInput`, `FilterChip`, `DataTable`, `Toolbar` bulk, `Pagination`, `EmptyState` | [resource list](references/resource-list.md) |
| Detail and edit | `PageHeader`, `Tabs`, `DescriptionList`, `FormSection`, `Field` | [detail and forms](references/detail-and-forms.md) |
| Create and delete | modal `Dialog`, `Toast` | [dialogs](references/dialogs.md) |
| Users and roles | `Avatar`, `Tag`, `StatusDot`, `Checkbox` matrix | [users and roles](references/users-roles.md) |
| Settings | `NavList`, `SettingRow`, `Switch`, `Select`, `ThemeSwitch` | [settings](references/settings.md) |
| Audit log | `Field` type date, `FilterChip`, `Disclosure`, `Pagination` | [audit log](references/audit-log.md) |
| Permissions | `can()` checks in every page | [permissions](references/permissions.md) |

## Rules

- Each page has one `PageHeader` (the only `h1`) and one primary `Button`.
- Every page that reads data has loading, error and empty states; test each with `renderToStaticMarkup`.
- Keep pages as a pure `XView` (props in, markup out) plus an `XPage` that loads data; tests render the view.
- Put filtering, sorting and CSV building in pure functions and unit test them.
- Hide an action the role can never use; disable one the role may see but cannot use right now, and say why.
- A destructive action opens a modal `Dialog` that names what is removed; its confirm button is the primary one.
- Sentence-case labels, no emoji, no exclamation marks, `en` and `vi` for every string.
- No raw colours, px or font sizes; use `var(--x-space-4)` style tokens and `font: var(--type-label)`.
- Finish with the `xdev-ui-review` skill.
