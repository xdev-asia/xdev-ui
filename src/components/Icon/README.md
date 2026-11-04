# Icon

Line icon set on a 24 grid: 1.75 stroke, round caps and joins, `currentColor`.

## Rules
- Size 16 in controls, 20 in banners, 22 in the activity bar. Stroke stays 1.75 at every size.
- Colour comes from the parent's `color`; never fill an icon.
- Decorative by default (`aria-hidden`). Pass `label` only when the icon stands alone without a text label nearby; `IconButton` handles that case.
- New icons: draw on the 24 grid with 2px padding, outline strokes only, and match the existing corner radii (rx 1–2).
- Names: `docs changes tasks squads agents kit accounts terminal` (activity bar) and `warn close plus search more branch` (UI).
