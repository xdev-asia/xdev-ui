---
name: xdev-ui-build-app
description: "Builds a React + Vite + TypeScript app on the @xdev-asia/ui design system: package setup, styles import, dark and light theme with ThemeSwitch, AppShell with NavList navigation, routing, en and vi strings, toasts, empty, loading and error states, a 360px layout and keyboard access. Use when starting a new app or screen with @xdev-asia/ui, or when adding app-wide setup such as theme, i18n or the shell."
license: Apache-2.0
---

# Build an app with @xdev-asia/ui

Start from the template, read the parts through MCP, and finish with the review skill. Do not guess props, colours or class names.

## 1. Start from the template

```bash
npx xdev-ui-skills create app my-app
cd my-app && pnpm install && pnpm dev
```

The template is in `templates/app`: shell, hash router, theme, `en` and `vi` strings, toasts and three pages. Copy it by hand if the command is not available (rename `_npmrc`, `_gitignore` and `_mcp.json` to dotfiles). Details: [setup](references/setup.md).

## 2. Wire the MCP server

Add `_mcp.json` as `.mcp.json`. Then ask the server instead of the source:

- `xdevui_get_guidelines` with `topic="setup"` once, then `topic="layout"` before you build the shell;
- `xdevui_list_components` to pick parts;
- `xdevui_get_component` for every part you use;
- `xdevui_search_tokens` for a colour, space, radius or type size.

## 3. Shell

One `AppShell` per app. Navigation is a `NavList` in `nav`, the `Breadcrumb` in `crumbs`, account and search in `actions`. Never use `ActivityBar` for page navigation. See [app shell](references/app-shell.md).

## 4. Theme

Import `@xdev-asia/ui/styles.css` once, set `data-theme` on `<html>`, and drive it with `ThemeSwitch` plus `applyTheme`. See [theme](references/theme.md).

## 5. Strings

Every visible string lives in `en.ts` and `vi.ts` with the same keys. Library parts take `labels` from `xdev-ui-labels.ts`. See [i18n](references/i18n.md).

## 6. Routing

A hash router with `matchRoute` and `useRoute` keeps the template free of extra packages. See [routing](references/routing.md).

## 7. States

Every page that reads data has loading, error and empty states, and a toast after a save. See [states](references/states.md). Layout and keyboard rules: [responsive and a11y](references/responsive-a11y.md).

## 8. Review

Run the `xdev-ui-review` skill: `node <skill-dir>/scripts/audit.mjs src --i18n src/i18n`, then its manual checklist. Fix errors; do not silence rules.

## Rules agents break most

- Import `@xdev-asia/ui/styles.css` once; `data-theme="dark"` (default) or `"light"` on `<html>`.
- Use only props that `xdevui_get_component` returns. No raw hex, px or font sizes: use a design token such as `var(--x-space-4)`.
- One primary `Button` per surface, last in `.dialog-actions`. Cyan `--x-color-signal` is the focus ring only.
- State is a tint, a 1px border or a `StatusDot`. Never a coloured left stripe on a rounded card or row.
- Labels: sentence case verbs ("Create item"), no emoji, no exclamation marks; ship `en` and `vi`.
- `AppShell` for the app frame, never `ActivityBar`.
- Brand mark: use `BrandMark`; never recolour it.
