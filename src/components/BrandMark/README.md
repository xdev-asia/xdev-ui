# BrandMark

The xDev logo v12: two folded blades that cross into an `x`. As a bare mark, an app tile, or the tile + wordmark lockup, for the parent brand or one of its sub-systems.

## Variants
| variant | look | use |
|---|---|---|
| `mark` | bare `<svg class="x-mark">` named by `label` (default: the system's name; `label=""` makes it decorative); your blade follows `color`, the agent side is `--brand-agent`, the core is white | app chrome, inline |
| `tile` | the mark on a dark ground; flat under 48 px, the lit icon (glow, blades lit from above, bright core) from 48 px up | favicon, avatar, social, app icon |
| `lockup` | tile + the name in Be Vietnam Pro: `xDev` at 800, a sub-system name at 500 | site header, docs, README |

`size` is the mark or tile edge in px; the lockup wordmark is `size × 25/32`.

## Systems
`system` picks whose mark it is: `xdev` (default, the parent brand), `cleaner`, `ui`. Every system keeps your blade; only the agent side changes. A system is added only once it is public.

## Rules
- The agent side is always `--brand-agent` `#ff7a3d`. Only your blade follows the surface colour.
- Keep clear space of at least the width of one blade on all sides.
- Never swap the blades, show an agent shape without your blade, recolour the tile ground, outline the mark, or set the wordmark in another face or weight.
- Static files live in `assets/brand` (`@xdev-asia/ui/brand/*`); `docs/brand.md` lists them.
