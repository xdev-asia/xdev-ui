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
- **Contrast.** `text-3` is the quietest text step (timestamps, counts, placeholders, hints). It is still 4.5:1 on every workspace ground in both themes, so it may carry text a user reads. Use `--line-strong` (at least 3:1) for the edge of a control that has no other boundary; `--line` stays a decorative hairline between regions.

## Iconography

- Line icons on a 24 grid, stroke `currentColor` 1.75, round caps and joins, no fills.
- 16px in controls, 20px in banners, 22px in the activity bar.
- The set: `docs changes tasks squads agents kit accounts terminal` (from ActivityBar.tsx) plus `warn close plus search more branch chevron-left chevron-right magnifier prompt folder file check alert warn-dash restore history bot download copy plug lock swap list-checks workflow`.
- Shell icons: `board` (kanban columns), `automation` (loop with a play mark), `panel-right` (right-docked panel), `split` (two panes), `inbox`, and `zap` (the bolt) for quick actions.
- The brand mark (logo v9) is a round-capped `Ã—` plus the agent cursor in `--brand-agent` `#ff7a3d`: a prompt waiting for input. The `Ã—` follows the surface colour; the cursor is always orange.

## Layout

- **One shell per app.** `AppShell` holds the brand, the `NavList` groups, the `Breadcrumb` and account actions in the top bar, and the page in `<main>`. `ActivityBar` is for the xDev workspace rail, not for page navigation.
- **Drawer below 768px.** The sidebar becomes a drawer: control it with `navOpen` and `onNavOpenChange`, close it when an item is chosen, and let Escape close it.
- **One `PageHeader` per page.** It renders the page's only `h1`; actions sit at the end with the primary one last, and wrap under the title on narrow screens.
- **`FormSection` groups fields.** A heading, an optional description, fields in one column (two above 480px with `columns={2}`) and the Save and Cancel actions at the end.
- **Design for 360px.** No horizontal page scroll. Widths come from `%`, `ch`, `rem` and the space tokens; rows of controls use `flex-wrap`. A `DataTable` scrolls inside its own wrapper and drops its `hideNarrow` columns.
- **Hairlines divide regions.** Cards and rows are separated by 1px `--line`, not by shadows or coloured edges.
- **Page layout.** Public web pages (sign-in, account portal, legal) sit in `SiteShell`; the desktop app uses `AppShell`. `Container` caps the width (`size` sm 640 to 2xl 1536, default xl) with a 16px gutter. `Stack` spaces children on one axis with a space step (`gap` 1, 2, 3, 4, 6, 8). `Grid` sets columns per breakpoint (`columns={{ base: 1, md: 2, xl: 4 }}`) or fits cells of `minItemWidth`; `responsive="container"` measures the grid's own width, for grids inside a panel or a `Drawer`.
- **Breakpoints.** sm 640, md 768, lg 1024, xl 1280, 2xl 1536 (`--x-bp-*`, `BREAKPOINTS`), the same as Tailwind. Mobile first: a value applies from its breakpoint up. Lay out with CSS; `useBreakpoint()` is for behaviour CSS cannot express and renders "base" on the server.
- **Stacking.** z-index comes from `--x-z-*`: raised 1, sticky 5, dropdown 21, nav 30, modal 40, toast 50, skip 60. Never write a number.

### Layout with Tailwind

An app that already uses Tailwind v4 imports the generated theme, so utilities speak the xdev tokens:

```css
@import "tailwindcss";
@import "@xdev-asia/ui/styles.css";
@import "@xdev-asia/ui/tailwind.css";
```

- Colours: `bg-panel`, `text-ink`, `text-muted`, `border-line`, `bg-accent text-on-accent`, `bg-danger-soft`. They follow the theme because they point at `--x-color-*`.
- Radii `rounded-sm|md|lg`, fonts `font-sans|mono`, breakpoints `sm:` to `2xl:` match the tokens. Tailwind's spacing step is 4px, the same as `--x-space-1`, so `p-4` is 16px.
- Shadows and z-index have no utility names: use `shadow-(--shadow-menu)` and `z-(--x-z-modal)`.
- Use the components for anything they cover; utilities are for page glue (spacing, a flex row, a one-off grid).

## Data and forms

- **Lists.** A `DataTable` has a `caption`, sortable columns, optional row selection and a `labels` object for each language. Pair it with `SearchInput`, `FilterChip` (with counts) and `Pagination`; reset to page 1 when a filter changes. Put filtering, sorting and paging in pure functions (`sortTableRows`, `paginateRows`) and test them. A facet with many values (status, role, tag) is a `FacetFilter`; actions on the selected rows go in a `BulkBar` that appears while rows are selected. `reorderable` adds drag handles for lists with a manual order; it is off while a sort is active.
- **Summaries.** `StatTile` shows one number with an optional delta; the caller decides whether up is good (`deltaTone`). Use `Meter` for a share of a limit and `DescriptionList` for the facts of one record.
- **Forms.** Validate in a pure function and show the message through `Field` `error`, which replaces the hint. Save stays disabled until the form changes and while it saves; Cancel is secondary and comes first. A `Switch` applies at once and does not belong in a form with Save.
- **Destructive actions.** A modal `Dialog` with `alert` names the thing removed and has the primary confirm button last.
- **Three states per page.** Loading (`Spinner`, or `loading` on `DataTable` and `StatTile`), error (`Banner` with a secondary "Try again") and empty (`EmptyState` naming the search text when filters match nothing). Confirm saves with a `Toast`.
- **Permissions.** Hide an action the role can never use; disable one the role may see but not use now, and say why. The server checks again.

## Agent skills

The package ships four skills in `skills/`, in the open Agent Skills format (a `SKILL.md` with `name`, `description` and `license`, plus `references/` and `templates/`):

| skill | use it to |
|---|---|
| `xdev-ui-build-app` | start an app: shell, theme, i18n, routing, states; template `templates/app` |
| `xdev-ui-admin` | design and build console screens: UX principles, layout (Container, Stack, Grid, Tailwind theme), dashboard, lists, forms, rich content, states, navigation, roles, settings, audit log, review checklist; template `templates/admin` |
| `xdev-ui-review` | audit a UI with `scripts/audit.mjs` (tokens, stripes, primary buttons, en and vi parity, focus, names, target size, motion, contrast) and a manual checklist |
| `xdev-ui-ux-standards` | design and review against WCAG 2.2 AA, the APG patterns, the macOS, Windows and GNOME guidelines and the ten usability heuristics |

Install them with `npx xdev-ui-skills install` (`--codex`, `--cursor`, `--user`, `--dir <path>`, `--skill <name>`, `--force`, `--dry-run`), scaffold an app with `npx xdev-ui-skills create app|admin <dir>`, or add the Claude Code plugin: `/plugin marketplace add xdev-asia/xdev-ui`, then `/plugin install xdev-ui@xdev-asia`. Agents without a file install read a skill through the MCP tool `xdevui_get_skill`, or use the prompts `xdevui_build_app` and `xdevui_build_admin`.

## Standards

The library targets WCAG 2.2 level AA on macOS, Windows and Linux. The `xdev-ui-ux-standards` skill holds each rule with the page it came from.

- **Keyboard.** Every component follows its WAI-ARIA Authoring Practices pattern; a composite widget is one Tab stop and arrow keys move inside it. Known gaps: `Menu`, `TabStrip`, `Toolbar` and `ZoomBar`.
- **Focus.** The ring is `--x-color-focus`, at least 3:1 on every ground. Never remove the outline without a `:focus-visible` replacement.
- **Contrast.** Body text 4.5:1 (`text-1` to `text-3`), UI parts 3:1 (`--line-strong`, `--x-color-line-strong`, the focus ring). The only pairs below that are the decorative hairlines `--line` and `--x-color-line`; `prefers-contrast: more` swaps them, `--text-2` and `--text-3` for stronger values. `audit.mjs --contrast` lists every pair.
- **Targets.** Pointer targets are 24 by 24 CSS px, or have 24px of clear space.
- **Preferences.** Motion stops under `prefers-reduced-motion: reduce`; focus and state stay visible under `forced-colors: active`.
- **Platforms.** One behaviour on every platform: Cancel before the primary button, sentence case, Cmd or Ctrl plus comma for settings, F6 to the next pane, native window controls.

## Components

| group | components |
|---|---|
| Actions | Button, IconButton, ActionTile, ZoomBar |
| Inputs | Segmented, ColorField, SwatchGroup, CodeInput, ThemeSwitch, Select, FontField, Field, Switch, Checkbox, RadioGroup, Textarea, SearchInput, SearchPicker, FilterChip, FileDrop, Combobox, DatePicker, DateRangePicker |
| Display | Kbd, PairingCode, ThemePreview, Avatar, Identity, List, Prose, Badge, Tag, AgentChip, DiffStat, Comment, ReactionBar, ListRow, ResourceCard, Card, EmptyState, SettingRow, CodeBlock, Heatmap, CommitGraph, PanZoom, WorktreeRow, UsageMeterRow, ReviewComment, AgentRow |
| Status | StatusDot, Meter, Banner, Toast, Spinner, FieldMessage, StepDots, Toaster, Skeleton, RunTimeline |
| Navigation | TabStrip, ActivityBar, StatusBar, Tabs, NavList, Breadcrumb, TreeView, Disclosure, SplitHandle, Toolbar, BottomNav |
| Overlays | Menu, Dialog, CommandPalette, Popover, Tooltip, Coachmark, MenuButton, FormDialog, Drawer, AttentionInbox |
| Brand | BrandMark, Icon, FileIcon |
| Layout | AppShell, SiteShell, PageHeader, FormSection, ThemeEditor, Board, BoardColumn, BoardCard, SaveBar, Container, Stack, Grid, SessionBar, ApprovalBar, Composer, LaunchCard, SettingsShell |
| Data | DescriptionList, StatTile, DataTable, Pagination, FacetFilter, BulkBar, SortableList |
| Image (`@xdev-asia/ui/image`, peer `react-easy-crop`) | ImageCropper, ImageField |

Each component folder has its rules in `README.md`; props are the exported `*Props` types.

### Subpaths

| entry | content | peers |
|---|---|---|
| `@xdev-asia/ui/editor` | RichTextEditor (Markdown by default, or HTML) | `@tiptap/*` (core, react, pm, starter-kit, extension-image, extension-link, extensions, markdown) |
| `@xdev-asia/ui/image` | ImageCropper, ImageField, crop helpers (`cropToBlob`, `resizeToBlob`, `sameAspect`) | `react-easy-crop` |

Subpath components keep their rules in `src/<entry>/<Name>/README.md`; their CSS ships in `styles.css`. The core entry never loads a peer.
