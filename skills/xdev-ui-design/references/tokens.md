# Tokens by role

Pick a token by what the thing *is*, not by the colour you want. The values below are from `src/styles/tokens.css` (generated from `tokens/tokens.json`); the role stays when a value changes. Search them with `xdevui_search_tokens`.

## Contents
- Two layers
- Surfaces and lines
- Text
- Accent, signal and state
- Type
- Space, radius and size
- Elevation and layers
- Breakpoints and containers
- Icons

## Two layers
- **Graphite (workspace) layer** (`--bg-0`, `--text-1`, `--accent`, `--ok` and the rest): the desktop shell, panes, tabs, terminals, menus.
- **Semantic layer** (`--x-color-*`): the docs app, the site, dialogs and shared components. `--x-color-focus` is the focus ring everywhere.
- Inside a workspace surface the library remaps the semantic layer onto graphite, so one component works in both. In app CSS, use the layer the surrounding library parts use; do not mix both on one surface.

## Surfaces and lines

| token | role | dark | light |
|---|---|---|---|
| `--bg-0` | page behind everything | #0d0e11 | #eceef2 |
| `--bg-1` | shell, sidebar, panels | #15161a | #f6f7f9 |
| `--bg-2` | cards, inputs, raised content | #1c1d22 | #ffffff |
| `--bg-3` | hover, selected row, pressed | #25262c | #e8eaee |
| `--term` | terminal and code ground | #111215 | #ffffff |
| `--line` | 1px hairline between regions | #2a2b31 | #dcdfe5 |
| `--line-strong` | control borders that must meet 3:1 | per theme | per theme |

## Text

| token | role | dark | light |
|---|---|---|---|
| `--text-1` | body and titles | #e6e7eb | #16171c |
| `--text-2` | secondary text, metadata | #a3a4ae | #555864 |
| `--text-3` | hints, placeholders | #8f909b | #666974 |

## Accent, signal and state

| token | role | dark | light |
|---|---|---|---|
| `--accent` | the next action, the current place | #2f62e6 | #2453d6 |
| `--signal` | focus ring only | #5bd8ff | #06699a |
| `--ok` / `--ok-bg` | healthy, connected, saved | #4ade9b | #0e7446 |
| `--warn` / `--warn-bg` | needs attention, degraded | #f2b544 | #8a5200 |
| `--danger` / `--danger-bg` | failed, destructive | #ff7a7a | #b42318 |
| `--violet` / `--violet-bg` | category colour (tabs, graph lanes, renamed files) | #b69cff | #5b3cc4 |
| `--orange` / `--orange-bg` | category colour | #f0a070 | #a04a14 |
| `--brand-agent` | the logo cursor, nothing else | #ff7a3d | #ff7a3d |

The `-bg` tints are 10 to 12% of the state colour: use them as the ground behind state text, never as a full fill. Category colours for tabs and charts come from `--x-tab-color-1` to `--x-tab-color-10` and `--x-graph-lane-1` to `--x-graph-lane-5`.

## Type

| token | use |
|---|---|
| `--type-page-title` | 700 20px, one per page |
| `--type-dialog-title` | 700 18px |
| `--type-heading` | 600 16px, section and card headings |
| `--type-body` | 400 14px/1.6, prose |
| `--type-control` | 600 13px, buttons and inputs |
| `--type-menu`, `--type-tab` | 400 13px |
| `--type-label` | 600 12px, field labels |
| `--type-status` | 400 12px, status bar and meta |
| `--type-section` | 600 11px, uppercase section labels |
| `--type-badge`, `--type-tag` | 11px and 10px chips |
| `--type-mono`, `--type-kbd` | 12px and 11px JetBrains Mono |
| `--type-stat`, `--type-mono-stat` | 600 22px and 10px mono, numbers in tiles |

Faces: `--font-body` (Be Vietnam Pro) and `--font-mono` (JetBrains Mono). Always set the whole shorthand: `font: var(--type-body)`.

## Space, radius and size

| group | tokens |
|---|---|
| space | `--x-space-1` 4, `--x-space-2` 8, `--x-space-3` 12, `--x-space-4` 16, `--x-space-6` 24, `--x-space-8` 32 |
| radius, workspace | `--radius-s` 4 (tags, chips, menu items), `--radius-m` 6 (icon buttons, fields, palette), `--radius-l` 8 (menus, toasts) |
| radius, semantic | `--x-radius-sm` 4 (keys, dialog inputs), `--x-radius-md` 8 (buttons), `--x-radius-lg` 12 (banners, activity items) |
| heights | `--h-header` 38, `--h-tab` 32, `--h-row` 28, `--h-toolbar` 28, `--h-footer` 26 |
| widths | `--w-side` 296 (sidebar), `--w-panel` 300 (side panel) |
| avatars | `--avatar-sm` 20, `--avatar-md` 32, `--avatar-lg` 48 |

## Elevation and layers
- Shadows exist only for floating layers: `--shadow-menu` (menus, popovers, combobox lists), `--shadow-dialog` (dialogs, drawers, command palette).
- Stacking: `--x-z-raised`, `--x-z-sticky`, `--x-z-dropdown`, `--x-z-nav`, `--x-z-modal`, `--x-z-toast`, `--x-z-skip`. Never a raw `z-index` number.

## Breakpoints and containers
- Breakpoints `--x-bp-sm` 640, `--x-bp-md` 768, `--x-bp-lg` 1024, `--x-bp-xl` 1280, `--x-bp-2xl` 1536 (CSS cannot read them in media queries; write the same numbers there or use `Grid responsive="container"`).
- `Container` sizes map to `--x-container-sm` to `--x-container-2xl`.

## Icons
- Library icons only (`Icon`, or `icon` props), listed by `xdevui_list_icons`: line icons on a 24 grid, stroke `currentColor` 1.75, round caps and joins, no fills.
- 16px in controls, 20px in banners, 22px in the activity bar.
- No emoji as icons, no second icon set. A missing icon is added to xdev-ui.
