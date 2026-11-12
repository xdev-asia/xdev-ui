# Brand: logo v9

The xDev logo is a round-capped `×` plus an orange agent cursor. It ships as the `BrandMark` component and as files in `assets/brand` (`xdev-mark.svg`, `xdev-mark-tile.svg`, `xdev-lockup-dark.svg`, `xdev-lockup-light.svg`, `xdev-icon-512.png`).

## Contents
- Which variant where
- In an app shell
- Rules
- What goes wrong

## Which variant where

| variant | look | use |
|---|---|---|
| `mark` | bare `×` in the surface colour, cursor in `--brand-agent` | app chrome: shell header, sign-in, about |
| `tile` | white `×` and orange cursor on the blue tile | favicon, app icon, avatar of the product, social cards |
| `lockup` | tile plus "xDev" in Be Vietnam Pro 800 | site header, docs, README, slides |

`size` is the mark or tile edge in px (the shell uses 18 or 20; sign-in uses 64). The lockup wordmark is `size × 25/32`.

## In an app shell

```tsx
import { AppShell, BrandMark } from "@xdev-asia/ui";

<AppShell
  brand={
    <a className="myapp-brand" href="#/">
      <BrandMark size={20} label="" />
      <span className="myapp-brand-name">{t("app.name")}</span>
    </a>
  }
  nav={nav}
>
  {page}
</AppShell>
```

- `label=""` makes the mark decorative because the app name is written next to it; with no text beside it, keep the default label.
- The app name is text, `--type-heading` or `--type-control`, in `--text-1`. A version or environment tag after it uses `--type-mono` in `--text-3`.
- Product names are "xDev <Thing>" in prose; in the shell the mark already says xDev, so the name can be the thing alone.

## Rules
- The cursor is always `--brand-agent` (#ff7a3d), in both themes. Only the `×` follows the surface colour.
- Clear space of at least half the mark's height on every side.
- Never recolour the tile, add an outline, a shadow or a gradient, rotate the mark, or set the wordmark in another face or weight.
- `--brand-agent` appears nowhere else in the UI: not on buttons, links or states.
- Do not draw the logo again in app code; import `BrandMark` or the files above.
- Third-party logos (providers, integrations) go in an `Emblem` with `src`, never next to the xDev mark at the same size.

## What goes wrong

| what you see | cause | fix |
|---|---|---|
| The mark is a blue square in the header | `variant="tile"` used in chrome | `variant="mark"` |
| The cursor turns blue or grey | a `color` style on a wrapper that the SVG inherits for the cursor too, or a redrawn logo | use `BrandMark`; set colour only on its container |
| The mark is clipped or misaligned | an app class named like a library class | app classes carry the app prefix, never `x-` |
| Two logos in the header | an old logo image left beside `BrandMark` | remove the image |
