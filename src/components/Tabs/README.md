# Tabs

Row of tabs that switches between views of one surface, such as the panels of a worktree.

## Anatomy
`div.kit-tabs[role=tablist][data-variant]` > `button.kit-tab[role=tab][aria-selected]` (label, optional `.kit-tab-badge`).

## Rules
- For views of the same object. Terminal sessions use `TabStrip`; app sections use `NavList` or `ActivityBar`.
- Roving tabindex: only the selected tab is in the Tab order. ArrowLeft/ArrowRight move and select, Home/End jump to the ends, disabled tabs are skipped.
- `variant="underline"` (2px accent underline) for panels and pages; `"pill"` (tint and 1px border) for a compact switch inside a `Card`.
- Badges are counts; `badgeTone="danger"` only for failures. Keep labels to one or two words.
- With `idPrefix`, render each panel as `role="tabpanel"` with id `<idPrefix>-panel-<id>` and `aria-labelledby` set to `<idPrefix>-tab-<id>`.
