# Page check: dashboard

**This page is a dashboard when** it opens with totals (`StatTile`) and charts (`BarChart`, `Heatmap`, `LineChart`, `FlowMap`) over a period, and the person reads it more than they act on it.

Source rules: `xdev-ui-admin/references/dashboard.md`, `states-feedback.md`.

## Auto (audit.mjs)
- `stat-delta`: a `StatTile` with a `delta` and no `hint` saying what it is compared with.
- `i18n-labels` (with `--i18n`): a `StatTile`, `BarChart` or `ZoomBar` with no `labels`.
- Chart props the types require (`label` on `BarChart`, `Heatmap`) fail `tsc`, so run the typecheck too.

## By hand
- [ ] **Loading.** Tiles render with `loading`, and charts show a skeleton. The page never returns `null` while waiting.
- [ ] **Error.** A failed load shows a `Banner` with "Try again" above the tiles. Tiles from an earlier good load may stay.
- [ ] **Empty.** A period with no data shows an inline `EmptyState`, not a flat zero chart with no words.
- [ ] **Delta tone.** For each tile, ask whether up is good. Errors, latency and cost going up are `deltaTone="bad"`. The tone is set by the caller, never left to the arrow.
- [ ] **Delta basis.** The delta comes from data (not a literal such as `"+12%"`) and its `hint` names the period it is compared with.
- [ ] **Numbers** use `Intl.NumberFormat` in the active language, with units ("1.2k requests", "340 ms").
- [ ] **Grid.** At 360px the tiles fall to one column. At 1440px they do not stretch past about 22ch each (`repeat(auto-fit, minmax(min(100%, 22ch), 1fr))` or `Grid columns`).
- [ ] **Period.** The period control is in the URL. Changing it keeps the scroll position and does not blank the page.
- [ ] **Charts** have a name and a text or table alternative, and colour is never the only cue.
