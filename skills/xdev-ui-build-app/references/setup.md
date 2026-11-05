# Setup

## Install

```bash
pnpm add @xdev-asia/ui react react-dom
```

The package is on the GitHub registry. `_npmrc` in the template maps the scope; log in once with `npm login --registry=https://npm.pkg.github.com --scope=@xdev-asia`. The token needs `read:packages`. Never commit a token. `xdev-ui-skills create` pins `@xdev-asia/ui` to the release that ships the template (`^x.y.z`); if you copy the template by hand, replace `latest` with the version you install.

## Entry file

```tsx
import "@xdev-asia/ui/fonts.css";
import "@xdev-asia/ui/styles.css";
import "./app.css";
```

- `styles.css` carries tokens and every component; import it once, before `app.css`.
- `fonts.css` is optional; without it the system stack is used.
- `index.html` sets `<html lang="en" data-theme="dark">`.

## App CSS

Use tokens only: `var(--x-space-4)`, `var(--text-2)`, `font: var(--type-status)`. Find a token with `xdevui_search_tokens`.
