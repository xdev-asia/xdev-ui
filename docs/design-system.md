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
| Graphite (workspace) | `bg-0…bg-3`, `line`, `text-1…3`, `accent`, `ok`, `warn`, `danger`, `signal`, `violet`, `orange` | the desktop shell: panes, tabs, terminals, menus |
| Semantic (`@xdev/ui`) | `x-color-bg`, `x-color-panel`, `x-color-surface`, `x-color-ink`, `x-color-accent`, … | docs app, site, dialogs, shared components |

Inside a workspace surface, `.x-ws` remaps the semantic layer onto graphite, so one component works in both places.

### Rules
- **Dark first.** `dark` is the default theme; `light` mirrors every token. Previews render dark; toggle the theme to check light.
- **Hairlines, not shadows.** Separation is a 1px `--line`. Shadows (`--shadow-menu`, `--shadow-dialog`) are only for floating layers: menus, dialogs, the palette.
- **Tint, border or dot for state.** Never a coloured left stripe on a rounded card or row.
- **4px grid.** Spacing `--x-space-1…8` = 4, 8, 12, 16, 24, 32px. Fixed chrome: header 38px, footer 26px, sidebar 296px, side panel 300px.
- **Radius.** Small and quiet. Workspace: `radius-s` 4px (tags, chips, menu items), `radius-m` 6px (icon buttons, fields, palette), `radius-l` 8px (menus, toasts). Semantic: `x-radius-sm` 4px (keys, dialog inputs), `x-radius-md` 8px (buttons), `x-radius-lg` 12px (banners, activity items).
- **One accent.** `--accent` / `--x-color-accent` blue marks the current thing: primary button, pressed segment, selected tab, current app. Cyan `--x-color-signal` is the focus ring only.
- **Motion.** Only the `working` dot pulses (off under `prefers-reduced-motion`). Apart from short positional transitions (0.12s), state changes are instant.
- **Type.** Be Vietnam Pro for interface text (13px controls and menus, 14px body, 18px dialog titles); JetBrains Mono for code, paths, counts and keys (10–12px).
- **Contrast.** `text-3` is kept at its source value (about 3.2:1 on bg-1 dark). Use it for non-essential hints only.

## Iconography

- Line icons on a 24 grid, stroke `currentColor` 1.75, round caps and joins, no fills.
- 16px in controls, 20px in banners, 22px in the activity bar.
- The set: `docs changes tasks squads agents kit accounts terminal` (from ActivityBar.tsx) plus `warn close plus search more branch chevron-left chevron-right magnifier prompt folder file check alert warn-dash restore history bot download copy plug lock`.
- The brand mark (logo v9) is a round-capped `×` plus the agent cursor in `--brand-agent` `#ff7a3d`: a prompt waiting for input. The `×` follows the surface colour; the cursor is always orange.

## Components

| group | components |
|---|---|
| Actions | Button, IconButton |
| Inputs | Segmented, ThemeSwitch, Select, Field, Switch, Checkbox, RadioGroup, Textarea, SearchInput, FilterChip |
| Display | Kbd, Badge, Tag, AgentChip, DiffStat, ListRow, Card, EmptyState, SettingRow, CodeBlock |
| Status | StatusDot, Meter, Banner, Toast, Spinner, FieldMessage |
| Navigation | TabStrip, ActivityBar, StatusBar, Tabs, NavList, Breadcrumb, TreeView, Disclosure, SplitHandle, Toolbar |
| Overlays | Menu, Dialog, CommandPalette, Popover, Tooltip |
| Brand | BrandMark, Icon |

Each component folder has its rules in `README.md`; props are the exported `*Props` types.
