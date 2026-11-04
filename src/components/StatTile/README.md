# StatTile

Flat tile with one headline number, its label and an optional change since a period.

## Anatomy
`div.x-stat` > `p.x-stat-label`, `p.x-stat-value` (`font: var(--type-stat)`), optional `p.x-stat-foot` (`span.x-stat-delta[data-tone]`, `span.x-stat-hint`), optional `div.x-stat-extra`. While `loading`, the value is replaced by a `Spinner`.

## Rules
- One number per tile. The caller formats it (`Intl.NumberFormat(locale)`) and the delta.
- `deltaTrend` draws the direction; `deltaTone` says whether it is good. Up is not always good (errors up is bad), so the caller sets the tone. Colour never carries the meaning alone: the sign and the arrow stay.
- `hint` names the basis of the delta ("vs last 7 days"); put a `Meter` or a short list in `children`, not a second number.
- `loading` shows one `Spinner` and sets `aria-busy`; keep the label so the grid does not jump. On a failed load, show a `Banner` with a retry action above the tiles instead of zeros.
- Flat: 1px `--line` border, no shadow, no coloured stripe. Tiles sit in a grid that wraps; one per row at 360px.
- `labels` (`StatTileLabels`: `loading`) overrides the English default.
