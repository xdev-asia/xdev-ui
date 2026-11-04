# xdev-ui

Design tokens and React components for the xDev agent workspace. Published as **`@xdev-asia/ui`** on GitHub Packages.

## Install

`.npmrc` in the consuming repo:

```ini
@xdev-asia:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

The token needs `read:packages`. In GitHub Actions of another `xdev-asia` repo, grant that repo read access under *Package settings → Manage Actions access*, then use `secrets.GITHUB_TOKEN`.

```bash
pnpm add @xdev-asia/ui
```

## Use

```tsx
import "@xdev-asia/ui/styles.css";      // tokens + all component CSS
import "@xdev-asia/ui/fonts.css";       // optional: Be Vietnam Pro + JetBrains Mono (Google Fonts)
import { Button, TabStrip, BrandMark } from "@xdev-asia/ui";

<html data-theme="dark">                // or "light"
<Button icon="plus">Create session</Button>
```

| export | content |
|---|---|
| `@xdev-asia/ui` | 23 components, `ICONS`, `ICON_NAMES`, prop types |
| `@xdev-asia/ui/styles.css` | tokens + component CSS |
| `@xdev-asia/ui/tokens.css` | tokens only (CSS custom properties, dark + light) |
| `@xdev-asia/ui/tokens.json` | token source |
| `@xdev-asia/ui/brand/*` | logo v9 SVG/PNG, mobile icons |

Components: Button, IconButton, Segmented, Select, Field, Switch, Kbd, Badge, Tag, AgentChip, DiffStat, StatusDot, Meter, Banner, Toast, TabStrip, ActivityBar, StatusBar, Menu, Dialog, CommandPalette, BrandMark, Icon. Rules per component: `src/components/<Name>/README.md`. Brand book: [docs/brand.md](docs/brand.md). Foundations: [docs/design-system.md](docs/design-system.md).

## Develop

```bash
corepack pnpm install
corepack pnpm dev        # demo at http://localhost:5173
corepack pnpm build      # dist/
corepack pnpm test       # SSR smoke test over dist
```

`tokens/tokens.json` is the source of truth; `scripts/build-tokens.mjs` writes `src/styles/tokens.css`.

## Release (automatic)

Commits on `main` follow [Conventional Commits](https://www.conventionalcommits.org/). `release.yml` runs semantic-release:

| commit | release |
|---|---|
| `fix: …` | patch |
| `feat: …` | minor |
| `feat!: …` / `BREAKING CHANGE:` | major |
| `chore:`, `docs:`, `ci:` | none |

It tags `vX.Y.Z`, publishes to GitHub Packages and writes the GitHub release. `pages.yml` deploys the demo to GitHub Pages.
