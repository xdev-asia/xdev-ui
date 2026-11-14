# TimeSeriesChart

A single-series line and area over evenly spaced time buckets, with a crosshair and tooltip on hover, for how one measure moved over a period.

## Rules
- One series only, drawn in `--accent`; no legend, the card or `label` names the measure. Two measures of different scale are two charts, never two axes.
- `points` is one entry per bucket, oldest first. A `null` value leaves a gap (no data); `0` draws on the baseline.
- Every `label`, tick and axis text is written by the consumer, already translated and formatted; the library ships no text.
- Keep `ticks` sparse (5 to 7). `maxLabel` names the top gridline; the scale's top is the largest value.
- The chart carries a hidden table of the point labels, so the values are not only in the picture.
