# xDev brand assets

Logo v12 is two folded blades that cross into an `x`. The left blade is you. The right blade is the agent, always the agent orange `#ff7a3d` (`--brand-agent`). Where the blades overlap is the core, the brightest point of the mark. Typeface: Be Vietnam Pro 800 for `xDev`, 500 for a sub-system name.

## The mark

- Drawn on a 1024 grid. Each blade is 150 wide (measured horizontally) and 560 tall, folded at `y = 512`. The core is a diamond, 126 × 147.
- **Lit** (icons from 48 px up): the upper half of a blade is lighter than the lower half. Blue `#b9cfff` to `#4f84ff`, then `#2f62e6` to `#1a3db3`. Orange `#ffc9a3` to `#ff8a4f`, then `#ff7a3d` to `#d94e14`. The ground is dark (`#171d33` to `#06080e`) with a blue glow on your side and an orange glow on the agent's side.
- **Flat** (under 48 px, print, one colour): your blade follows the surface colour (`currentColor`, tinted with `--accent` by `.x-mark`), the agent blade is `#ff7a3d`, the core is white.
- Clear space: at least 150 on the grid, the width of one blade, on all sides.

## Systems

Every system keeps your blade in the same place. Only the agent side changes. No system has a colour of its own.

| System | `system` | Agent side |
|---|---|---|
| xDev | `xdev` | the orange blade, crossing yours |
| Cleaner for xDev | `cleaner` | a disk with one slice lifted out |
| xDev UI | `ui` | four squares in four tones |

This package is public. A system gets a mark here only once it is public too; `BrandMark.test.tsx` checks the list.

## Files

`scripts/build-brand.mjs` writes every SVG here. Its geometry is the same as in `src/components/BrandMark/BrandMark.tsx`; `BrandMark.test.tsx` fails when the two drift apart.

| File | Use |
| --- | --- |
| `xdev-icon.svg` | Lit icon, 1024, dark ground. The main icon of every system. |
| `xdev-icon-blue.svg` | Lit icon on a blue ground. The parent brand only. |
| `xdev-icon-512.png` | 512 px render of `xdev-icon.svg`; README header image and org avatar. |
| `xdev-mark.svg` | Flat mark; your blade is `currentColor`. Source of the `mark` variant of `BrandMark`. |
| `xdev-mark-lit.svg` | Lit mark without a ground, for dark surfaces. |
| `xdev-mark-tile.svg` | Flat tile for 16 to 32 px (favicon, small avatars). |
| `xdev-lockup-light.svg`, `xdev-lockup-dark.svg` | Icon plus wordmark for light and dark surfaces. Live text; bundle Be Vietnam Pro for the intended look. |
| `systems/xdev-<system>-{icon,mark,mark-lit,lockup-light,lockup-dark}.svg` | The same set for `cleaner` and `ui`. |
| `mobile/` | iOS (`ios-icon` on blue, `ios-icon-dark` on dark, both full-bleed) and Android adaptive (foreground, background, monochrome) sources, with 1024 px renders. |

## Sizes

- From 48 px up: the lit icon.
- From 16 to 32 px: the flat tile.
- `BrandMark variant="tile"` picks between the two by `size`.

## Regenerating

1. `pnpm brand` writes the SVG files.
2. Render the PNGs with any SVG rasteriser that supports filters. With librsvg:

```bash
rsvg-convert -w 512 assets/brand/xdev-icon.svg -o assets/brand/xdev-icon-512.png
```

```bash
for f in ios-icon ios-icon-dark android-background android-foreground android-monochrome; do rsvg-convert -w 1024 assets/brand/mobile/$f.svg -o assets/brand/mobile/$f-1024.png; done
```

## Rules

- Never recolour the agent side. It is always `#ff7a3d`.
- Never swap the blades. You are on the left.
- Never show an agent shape without your blade.
- Never stretch or rotate the icon, or add other effects to it.
