# Brand: logo v12

The xDev logo is two folded blades that cross into an `x`: your blade on the left follows the surface colour, the agent's on the right is always `--brand-agent`, and the core where they overlap is white. It ships as the `BrandMark` component and as files in `assets/brand` (`@xdev-asia/ui/brand/*`; `docs/brand.md` lists them).

## Contents
- Which variant where
- In an app shell
- Rules
- What goes wrong

## Which variant where

| variant | look | use |
|---|---|---|
| `mark` | bare mark; your blade follows `color`, the agent side is `--brand-agent` | app chrome: shell header, sign-in, about |
| `tile` | the mark on a dark ground; flat under 48px, lit from 48px up | favicon, app icon, avatar of the product, social cards |
| `lockup` | tile plus the name in the body font: `xDev` at 800, a sub-system name at 500 | site header, docs, README, slides |

`size` is the mark or tile edge in px (the shell uses 18 or 20; sign-in uses 64). The lockup wordmark is `size × 25/32`. `system` picks whose mark it is (`xdev`, `cleaner`, `ui`): every system keeps your blade and only the agent side changes.

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
- The agent side is always `--brand-agent` (#ff7a3d), in both themes. Only your blade follows the surface colour.
- Clear space of at least the width of one blade on every side.
- Never swap the blades, show an agent shape without your blade, recolour the tile ground, add an outline, a shadow or a gradient, rotate the mark, or set the wordmark in another face or weight.
- `--brand-agent` appears nowhere else in the UI: not on buttons, links or states.
- Do not draw the logo again in app code; import `BrandMark` or the files above.
- Third-party logos (providers, integrations) go in an `Emblem` with `src`, never next to the xDev mark at the same size.

## What goes wrong

| what you see | cause | fix |
|---|---|---|
| The mark sits on a dark square in the header | `variant="tile"` used in chrome | `variant="mark"` |
| The agent side turns blue or grey | a redrawn logo, or a `color` rule aimed at the agent blade | use `BrandMark`; set colour only on its container |
| The mark is clipped or misaligned | an app class named like a library class | app classes carry the app prefix, never `x-` |
| Two logos in the header | an old logo image left beside `BrandMark` | remove the image |
