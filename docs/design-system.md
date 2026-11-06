# xdev-ui

Design system and React component package (`@xdev-asia/ui`) for xDev: the desktop workspace where coding agents (Claude, Codex, custom profiles) run in local terminals beside docs, changes, tasks and kits. Built from `xdev-asia/xdev`: `apps/desktop/src/styles/*.css`, `apps/desktop/src/components/ActivityBar.tsx`, `packages/ui/tokens.json` and `docs/brand/`.

## Content fundamentals

- **Terse and technical.** Labels are verbs or nouns, sentence case: "Create session", "Kill session", "Changes (7)".
- **Name the object.** "Kill session fix-auth-redirect?", not "Are you sure?".
- **Say the consequence, not the mechanism.** "Uncommitted changes stay in the worktree."
- **Bilingual.** Every string ships in English and Vietnamese (`en`, `vi`). Be Vietnam Pro carries Vietnamese diacritics; keep labels short enough to survive a 30% longer translation.
- **Identifiers stay literal.** Branches, paths, commands and counts are set in mono and never translated.
- **No exclamation marks, no emoji in UI chrome.**

## Visual foundations

### Two token layers
| layer | names | where |
|---|---|---|
| Graphite (workspace) | `bg-0â€¦bg-3`, `line`, `text-1â€¦3`, `accent`, `ok`, `warn`, `danger`, `signal`, `violet`, `orange` | the desktop shell: panes, tabs, terminals, menus |
| Semantic (`@xdev/ui`) | `x-color-bg`, `x-color-panel`, `x-color-surface`, `x-color-ink`, `x-color-accent`, â€¦ | docs app, site, dialogs, shared components |

Inside a workspace surface, `.x-ws` remaps the semantic layer onto graphite, so one component works in both places.

### Rules
- **Dark first.** `dark` is the default theme; `light` mirrors every token. Previews render dark; toggle the theme to check light.
- **Hairlines, not shadows.** Separation is a 1px `--line`. Shadows (`--shadow-menu`, `--shadow-dialog`) are only for floating layers: menus, dialogs, the palette.
- **Tint, border or dot for state.** Never a coloured left stripe on a rounded card or row.
- **4px grid.** Spacing `--x-space-1â€¦8` = 4, 8, 12, 16, 24, 32px. Fixed chrome: header 38px, footer 26px, sidebar 296px, side panel 300px.
- **Radius.** Small and quiet. Workspace: `radius-s` 4px (tags, chips, menu items), `radius-m` 6px (icon buttons, fields, palette), `radius-l` 8px (menus, toasts). Semantic: `x-radius-sm` 4px (keys, dialog inputs), `x-radius-md` 8px (buttons), `x-radius-lg` 12px (banners, activity items).
- **One accent.** `--accent` / `--x-color-accent` blue marks the current thing: primary button, pressed segment, selected tab, current app. Cyan `--x-color-signal` is the focus ring only.
- **Motion.** Only the `working` dot pulses (off under `prefers-reduced-motion`). Apart from short positional transitions (0.12s), state changes are instant.
- **Type.** Be Vietnam Pro for interface text (13px controls and menus, 14px body, 18px dialog titles); JetBrains Mono for code, paths, counts and keys (10â€“12px).
- **Contrast.** `text-3` is kept at its source value (about 3.2:1 on bg-1 dark). Use it for non-essential hints only.

## Iconography

- Line icons on a 24 grid, stroke `currentColor` 1.75, round caps and joins, no fills.
- 16px in controls, 20px in banners, 22px in the activity bar.
- The set: `docs changes tasks squads agents kit accounts terminal` (from ActivityBar.tsx) plus `warn close plus search more branch chevron-left chevron-right magnifier prompt folder file check alert warn-dash restore history bot download copy plug lock swap list-checks workflow`.
- The brand mark (logo v9) is a round-capped `Ã—` plus the agent cursor in `--brand-agent` `#ff7a3d`: a prompt waiting for input. The `Ã—` follows the surface colour; the cursor is always orange.

## Layout

- **One shell per app.** `AppShell` holds the brand, the `NavList` groups, the `Breadcrumb` and account actions in the top bar, and the page in `<main>`. `ActivityBar` is for the xDev workspace rail, not for page navigation.
- **Drawer below 768px.** The sidebar becomes a drawer: control it with `navOpen` and `onNavOpenChange`, close it when an item is chosen, and let Escape close it.
- **One `PageHeader` per page.** It renders the page's only `h1`; actions sit at the end with the primary one last, and wrap under the title on narrow screens.
- **`FormSection` groups fields.** A heading, an optional description, fields in one column (two above 480px with `columns={2}`) and the Save and Cancel actions at the end.
- **Design for 360px.** No horizontal page scroll. Widths come from `%`, `ch`, `rem` and the space tokens; rows of controls use `flex-wrap`. A `DataTable` scrolls inside its own wrapper and drops its `hideNarrow` columns.
- **Hairlines divide regions.** Cards and rows are separated by 1px `--line`, not by shadows or coloured edges.

## Data and forms

- **Lists.** A `DataTable` has a `caption`, sortable columns, optional row selection and a `labels` object for each language. Pair it with `SearchInput`, `FilterChip` (with counts) and `Pagination`; reset to page 1 when a filter changes. Put filtering, sorting and paging in pure functions (`sortTableRows`, `paginateRows`) and test them. A facet with many values (status, role, tag) is a `FacetFilter`; actions on the selected rows go in a `BulkBar` that appears while rows are selected. `reorderable` adds drag handles for lists with a manual order; it is off while a sort is active.
- **Summaries.** `StatTile` shows one number with an optional delta; the caller decides whether up is good (`deltaTone`). Use `Meter` for a share of a limit and `DescriptionList` for the facts of one record.
- **Forms.** Validate in a pure function and show the message through `Field` `error`, which replaces the hint. Save stays disabled until the form changes and while it saves; Cancel is secondary and comes first. A `Switch` applies at once and does not belong in a form with Save.
- **Destructive actions.** A modal `Dialog` with `alert` names the thing removed and has the primary confirm button last.
- **Three states per page.** Loading (`Spinner`, or `loading` on `DataTable` and `StatTile`), error (`Banner` with a secondary "Try again") and empty (`EmptyState` naming the search text when filters match nothing). Confirm saves with a `Toast`.
- **Permissions.** Hide an action the role can never use; disable one the role may see but not use now, and say why. The server checks again.

## Agent skills

The package ships three skills in `skills/`, in the open Agent Skills format (a `SKILL.md` with `name`, `description` and `license`, plus `references/` and `templates/`):

| skill | use it to |
|---|---|
| `xdev-ui-build-app` | start an app: shell, theme, i18n, routing, states; template `templates/app` |
| `xdev-ui-admin` | build console screens: dashboard, lists, detail, forms, roles, settings, audit log; template `templates/admin` |
| `xdev-ui-review` | audit a UI with `scripts/audit.mjs` (tokens, stripes, primary buttons, en and vi parity) and a manual checklist |

Install them with `npx xdev-ui-skills install` (`--codex`, `--cursor`, `--user`, `--dir <path>`, `--skill <name>`, `--force`, `--dry-run`), scaffold an app with `npx xdev-ui-skills create app|admin <dir>`, or add the Claude Code plugin: `/plugin marketplace add xdev-asia/xdev-ui`, then `/plugin install xdev-ui@xdev-asia`. Agents without a file install read a skill through the MCP tool `xdevui_get_skill`, or use the prompts `xdevui_build_app` and `xdevui_build_admin`.

## Components

| group | components |
|---|---|
| Actions | Button, IconButton, ActionTile, ZoomBar |
| Inputs | Segmented, ThemeSwitch, Select, FontField, Field, Switch, Checkbox, RadioGroup, Textarea, SearchInput, SearchPicker, FilterChip, FileDrop, Combobox |
| Display | Kbd, Avatar, Badge, Tag, AgentChip, DiffStat, Comment, ReactionBar, ListRow, Card, EmptyState, SettingRow, CodeBlock, Heatmap, CommitGraph, PanZoom |
| Status | StatusDot, Meter, Banner, Toast, Spinner, Skeleton, FieldMessage |
| Navigation | TabStrip, ActivityBar, StatusBar, Tabs, NavList, Breadcrumb, TreeView, Disclosure, SplitHandle, Toolbar |
| Overlays | Menu, Dialog, FormDialog, Drawer, CommandPalette, Popover, Tooltip |
| Brand | BrandMark, Icon, FileIcon |
| Layout | AppShell, PageHeader, FormSection, SaveBar |
| Data | DescriptionList, StatTile, DataTable, Pagination, FacetFilter, BulkBar |

Each component folder has its rules in `README.md`; props are the exported `*Props` types.

### Subpaths

| entry | content | peers |
|---|---|---|
| `@xdev-asia/ui/editor` | RichTextEditor (Markdown by default, or HTML) | `@tiptap/*` (core, react, pm, starter-kit, extension-image, extension-link, extensions, markdown) |
