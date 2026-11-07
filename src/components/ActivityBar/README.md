# ActivityBar

Vertical app switcher at the left edge of the desktop window.

## Rules
- Fixed order: Docs, Changes, Tasks, Squads, Agents, Kit, Accounts, Terminal.
- The current app has `aria-current="page"`, a `--x-color-surface-2` tint and a 2px accent pip at the bar edge (no glow); never two at once.
- Each button's `aria-label` and `title` is the app name; Changes adds its pending count, "Changes (7)".
- The count badge shows on Changes only, caps at "99+", and hides at zero.
- Icons are 22px from the `Icon` set.
- `labels` (`ActivityBarLabels`) takes a name per app plus `nav` (landmark name) and `count(base, n)` (label with pending count).
