# Heatmap

A grid of daily intensity cells, one column per week, for how much was used on each day.

## Rules
- `cells` is one entry per day, oldest first. The consumer decides each `level` (0 is none, 4 is the busiest) and writes each `label` already translated; the library ships no text.
- `startWeekday` (0 to 6) is the row of the first cell, so the columns line up with the week.
- State is a tint of `--signal` on `--bg-3`, never a stripe. The level is also in each cell's `label`, so colour is not the only carrier.
- The grid scrolls sideways inside its box, so it fits a 360 px panel.
- The legend shows only when both `lessLabel` and `moreLabel` are given.
