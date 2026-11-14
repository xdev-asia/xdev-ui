# Manual review checklist

Tick each item in the running app. Items marked (auto) are also covered by `scripts/audit.mjs`.

## Contents
- Tokens and type
- Layout at 360px
- Themes and language
- Keyboard and focus
- States
- Actions and labels
- Page types
- Standards

## Tokens and type
- (auto) No colour literal, no raw `px` except 1px hairlines, no raw font size: `font: var(--type-*)`.
- Spacing uses `--x-space-1` to `--x-space-8`; widths use `%`, `ch`, `rem`, `--w-side` or `--w-panel`.
- Cyan `--x-color-signal` appears only as the focus ring. The one accent `--accent` marks the current thing.
- Hairlines (1px `--line`) separate regions; shadows only on menus, dialogs and the command palette.

## Layout at 360px
- Resize the window to 375, 768 and 1440px wide, then 320px: no horizontal scroll on the page at any of them. Screenshot 375 as well as the desktop size.
- (auto, partial) `fixed-width` flags uncapped widths over 320px; `nowrap` flags `white-space: nowrap` on containers that neither scroll nor clip.
- A `DataTable` scrolls inside its own wrapper; `hideNarrow` columns have dropped.
- The `AppShell` sidebar is a drawer: the menu button opens it, the backdrop and Esc close it, and focus is not trapped behind it.
- `Dialog` and `FormDialog` (modal) open as a bottom sheet below 640px; a `Drawer` takes the full width.
- `PageHeader` actions wrap under the title; `FormSection` is one column; `Pagination` fits on one or two lines.
- Touch targets are at least `--x-space-6` high (44px on a touch screen, which the library sets under `pointer: coarse`); nothing overlaps. (auto, partial) Controls under 24px are flagged by `target-size`.

## Themes and language
- Switch `data-theme` between `dark` and `light` on `<html>`: no text loses contrast, no surface turns white or black by accident.
- Switch between `en` and `vi`: every label changes, nothing is clipped, library parts get `labels` in the active language.
- (auto) `en` and `vi` have the same keys and no empty values.
- Dates and numbers use `Intl.DateTimeFormat(locale)` and `Intl.NumberFormat(locale)`.

## Keyboard and focus
- Tab through the page: the order follows the reading order and the focus ring is visible on every control.
- (auto) No `outline: none` without a `:focus-visible` replacement; no positive `tabIndex`; icon-only buttons are named.
- Each widget follows its keyboard and ARIA contract in the `xdev-ui-ux-standards` skill (`references/patterns.md`).
- The skip link is the first stop and jumps to `main`.
- A `Dialog` with `modal` moves focus in, Esc cancels, and focus returns to the trigger.
- Icon-only buttons are `IconButton` with a `label`.
- A disabled control has no `Tooltip`; the reason is written next to it.

## States
- Every list has an empty state (`EmptyState`) that says what to do next; an empty search names the query.
- Loading uses one `Spinner` per region, `DataTable loading` or `StatTile loading`.
- A failed load shows a `Banner` with a retry action, not a blank page.
- A saved change shows a `Toast` in past tense; a failed save shows a `Banner` and keeps the user's input.

## Actions and labels
- One primary `Button` per surface, last in `.dialog-actions`.
- Destructive confirms use `Dialog` with `alert` and `modal`; the title names the object ("Delete user Ada?") and the primary button repeats the verb.
- Actions the role can never do are hidden; actions that become possible later (bulk actions with nothing selected) are disabled, not hidden.
- Labels are sentence-case verbs ("Create session"), with no emoji and no exclamation marks.
- State is a tint, a 1px border or a `StatusDot`; never a coloured left stripe on a rounded card or row.

## Page types
- Each page type has its own check in `references/pages/`: `pages/list.md`, `pages/dashboard.md`, `pages/settings.md`, `pages/dialogs-forms.md`, `pages/sign-in.md`, `pages/provider-grid.md`. Run the one for each page after this list.

## Standards
- This list covers the design-system rules. For WCAG 2.2 AA, the APG patterns, the platform decisions and the ten usability heuristics, walk `references/heuristics-checklist.md` in the `xdev-ui-ux-standards` skill. Run the audit with `--contrast` to list token pairs below WCAG contrast.
