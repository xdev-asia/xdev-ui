# Responsive

## Contents
- Breakpoints
- What the library already does
- What the app must still do
- Tables on a phone
- Checklist

## Breakpoints
sm 640, md 768, lg 1024, xl 1280, 2xl 1536 (`--x-bp-*`, `BREAKPOINTS`, Tailwind's `sm:` to `2xl:`). Mobile first: a value applies from its breakpoint up. Check every screen at three widths: **375** (phone), **768** (tablet, sidebar still a drawer), **1440** (desktop). Also drag down to 320 once to look for a horizontal scrollbar.

## What the library already does
Import `@xdev-asia/ui/styles.css` and these come with it; do not re-implement them.

| part | phone and tablet behaviour |
|---|---|
| `AppShell` | Sidebar is a drawer below 768px. Top-bar actions shrink with the title; an empty `SearchInput` there collapses to an icon below 640px and opens on focus. |
| `PageHeader`, `Toolbar`, `BulkBar`, `Card`, `SettingRow`, `SaveBar`, `EmptyState` | Title and actions wrap onto two lines; actions wrap among themselves. |
| `Button` | Label stays on one line; the row wraps instead. |
| `Dialog`, `FormDialog` (modal) | Bottom sheet below 640px, actions stacked with the primary on top, scrolls inside itself. |
| `Drawer` | Full width below 640px. |
| `Tabs`, `Segmented` | Scroll sideways inside themselves below 768px. |
| `TabStrip`, `StatusBar` | Scroll sideways inside themselves at every width. |
| `DataTable` | Scrolls inside its wrapper; select column pinned; `sticky`, `stack`, `hideNarrow` (below). |
| `Menu`, `Popover`, `DateRangePicker` | Stay inside the window. |
| `.ws-mono` text | Breaks anywhere, so long ids and URLs do not widen the page. |
| touch (`pointer: coarse`) | 44px hit areas on buttons, icon buttons, tabs, segments, menu items and inputs; 16px input text so iOS does not zoom. |

## What the app must still do
- **No fixed widths.** No `width` or `min-width` over 320px in app CSS. Use `max-width`, `min(30rem, 100%)`, `%`, `ch`, or a `Grid`. The audit warns (`fixed-width`).
- **No unbounded `nowrap`.** `white-space: nowrap` on a container needs `overflow` or `text-overflow: ellipsis` in the same rule. The audit warns (`nowrap`).
- **Lay out with `Grid` and `Stack`.** `Grid columns={{ base: 1, sm: 2, xl: 4 }}` or `minItemWidth="16rem"`; `responsive="container"` inside a `Drawer` or side panel. `Stack direction="row"` wraps by default; do not turn `wrap` off for action rows.
- **Page actions go to `PageHeader actions`**, primary last, not a hand-made flex row. Four actions at most; the rest in a `Menu`.
- **Top bar:** at most three icon actions next to the search on a phone; put the rest (theme, language, help) in the account `Menu`. Keep the `ShellTitle` short.
- **Forms:** one column; `FormSection columns={2}` only for short pairs. Quick forms in `FormDialog` already become a sheet; long forms are a page with `SaveBar`.
- **Behaviour, not layout, with `useBreakpoint()`:** for example `Drawer` instead of a side panel below `lg`. It returns "base" on the server and the first client pass, so the first paint must work at any width.
- **Wide content scrolls in its own box**: code, diffs, logs, charts. Never let them widen `main`.

## Tables on a phone
Pick one per table:

| table | on a phone |
|---|---|
| Many columns, people compare rows | Keep the table; it scrolls inside its wrapper. Put the row-actions column on `sticky="end"` and mark low-value columns `hideNarrow`. |
| Few rows people read one by one (members, invoices) | `stack`: below a 480px container each row becomes a card of "label: value" lines. Give icon-only or empty headers a `label`. Sort headers are hidden in stack mode, so offer sorting in a `Select` if it matters. |

```tsx
const columns: DataTableColumn<User>[] = [
  { key: "name", header: t("users.name"), cell: (u) => u.name },
  { key: "email", header: t("users.email"), cell: (u) => u.email, mono: true, hideNarrow: true },
  { key: "role", header: t("users.role"), cell: (u) => <Tag>{u.role}</Tag> },
  { key: "actions", header: "", label: t("common.actions"), width: "min", sticky: "end", cell: (u) => <IconButton icon="more" label={t("common.actionsFor", { name: u.name })} /> },
];

<DataTable caption={t("users.title")} columns={columns} rows={rows} rowKey={(u) => u.id} stack />
```

## Checklist
- [ ] 375px: no horizontal page scroll; the title is readable; actions wrap under it.
- [ ] 375px: dialogs open as a sheet; drawers fill the width; nothing sits under the keyboard.
- [ ] 375px: tables scroll inside their wrapper (actions pinned) or stack.
- [ ] 768px: sidebar is a drawer; tabs and segmented controls fit or scroll inside themselves.
- [ ] 1440px: the desktop layout is unchanged; content is capped by `Container`.
- [ ] 320px: still no page scrollbar.
- [ ] On a touch device or emulator: every control is at least 44px; inputs do not zoom the page.
- [ ] Screenshots at 375 and 1440, dark and light, with real data.
- [ ] The audit has no `fixed-width` or `nowrap` warnings, or each one is justified.
