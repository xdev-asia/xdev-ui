# DonutChart

A ring that splits one total into a few parts, with a legend that writes each value, for a share such as revenue by category.

## Anatomy
`figure.x-donut[aria-label]` > `.x-donut-ring` (`svg[aria-hidden]` with `circle.x-donut-track` and one `circle.x-donut-slice` per part, optional `.x-donut-center`) + `ul.x-donut-legend` > `li.x-donut-item` (`.x-donut-swatch`, `.x-donut-label`, `.x-donut-value`).

## Rules
- Use it for parts of one whole, at most 8; for comparing amounts that do not add up to a whole, use `BarChart`. Group the smallest parts into one "Other" slice past 8.
- Slices run clockwise from 12 o'clock in the given order; sort them largest first.
- Colours come from `DONUT_COLORS` (`--accent`, `--ok`, `--orange`, `--violet`, `--warn`, `--signal`, `--danger`, `--text-2`), so the ring follows the theme. The legend writes every label and value, so colour is never the only carrier; the ring itself is hidden from assistive tech.
- `label`, every `label`/`valueLabel` and `center` are written by the consumer, already translated and formatted; the library ships no text.
- `donutArcs(slices)` is the pure helper: each slice's share of 100 and its start. Negative and non-finite values count as zero; an all-zero chart draws only the track.

## Responsive
- The ring keeps its `size`; the legend sits beside it and wraps under it when the container is narrow.

## CSS classes
`.x-donut`, `.x-donut-ring`, `.x-donut-track`, `.x-donut-slice`, `.x-donut-center`, `.x-donut-legend`, `.x-donut-item`, `.x-donut-swatch`, `.x-donut-label`, `.x-donut-value`.
