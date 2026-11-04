# xdev-ui

Design tokens and React components for the xDev agent workspace. Published as **`@xdev-asia/ui`** on GitHub Packages.

## Install

`.npmrc` in the consuming repo:

```ini
@xdev-asia:registry=https://npm.pkg.github.com
```

The token needs `read:packages`, even though the package is public. pnpm ignores `${VAR}` in repo-level credentials, so put the token line in the user `~/.npmrc` (or a file named by `NPM_CONFIG_USERCONFIG` in CI):

```ini
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

In GitHub Actions of another `xdev-asia` repo, give the job `permissions: packages: read`, pass `GITHUB_TOKEN: ${{ github.token }}`, and if install returns 403, grant that repo read access under *Package settings → Manage Actions access*.

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
| `@xdev-asia/ui` | 56 components, `ICONS`, `ICON_NAMES`, prop types |
| `@xdev-asia/ui/styles.css` | tokens + component CSS |
| `@xdev-asia/ui/tokens.css` | tokens only (CSS custom properties, dark + light) |
| `@xdev-asia/ui/tokens.json` | token source |
| `@xdev-asia/ui/brand/*` | logo v9 SVG/PNG, mobile icons |
| `@xdev-asia/ui/ai-manifest.json` | components, props, classes, tokens, icons, guidelines as JSON |
| `@xdev-asia/ui/llms.txt`, `llms-full.txt` | the same for LLMs ([llmstxt.org](https://llmstxt.org)) |

Components: ActionTile, ActivityBar, AgentChip, AppShell, Avatar, Badge, Banner, BrandMark, Breadcrumb, Button, Card, Checkbox, CodeBlock, CommandPalette, Comment, CommitGraph, Dialog, DiffStat, Disclosure, EmptyState, Field, FieldMessage, FileIcon, FilterChip, FontField, Heatmap, Icon, IconButton, Kbd, ListRow, Menu, Meter, NavList, PageHeader, PanZoom, Popover, RadioGroup, ReactionBar, SearchInput, SearchPicker, Segmented, Select, SettingRow, Spinner, SplitHandle, StatusBar, StatusDot, Switch, Tabs, TabStrip, Tag, Textarea, ThemeSwitch, Toast, Toolbar, Tooltip, TreeView, ZoomBar. Rules per component: `src/components/<Name>/README.md`. Brand book: [docs/brand.md](docs/brand.md). Foundations: [docs/design-system.md](docs/design-system.md).

## AI agents (MCP)

The package ships a stdio MCP server, `xdev-ui-mcp` (`dist/mcp.js`, no extra dependencies). It gives agents the real props, tokens and rules, so they do not invent them.

`.mcp.json` in the consuming repo (Claude Code, Cursor, VS Code):

```json
{
  "mcpServers": {
    "xdev-ui": { "command": "node", "args": ["node_modules/@xdev-asia/ui/dist/mcp.js"] }
  }
}
```

Without installing (needs the `.npmrc` above; on Windows use `"command": "cmd", "args": ["/c", "npx", ...]`):

```bash
claude mcp add xdev-ui -- npx -y --package=@xdev-asia/ui xdev-ui-mcp
```

| tool | returns |
|---|---|
| `xdevui_list_components` | 56 components by group, with summary |
| `xdevui_get_component` | README rules, exported prop types, CSS classes, import line |
| `xdevui_search_tokens` | tokens by name, usage or category, with dark/light values |
| `xdevui_get_guidelines` | setup, voice, visual foundations, iconography, brand |
| `xdevui_list_icons` | valid `IconName` values |
| `xdevui_search_docs` | matching sections across all docs |

Resources: `xdev-ui://components/{name}`, `xdev-ui://guidelines/{topic}`, `xdev-ui://tokens`. Prompt: `xdevui_build_ui`. Agent rules: [AGENTS.md](AGENTS.md). No MCP client: <https://ui.xdev.asia/llms-full.txt>.

## Develop

```bash
corepack pnpm install
corepack pnpm dev        # demo at http://localhost:5173
corepack pnpm build      # dist/ (lib, mcp.js, AI manifest, llms.txt)
corepack pnpm test       # SSR smoke test + MCP smoke test over dist
```

`tokens/tokens.json` is the source of truth; `scripts/build-tokens.mjs` writes `src/styles/tokens.css`, `scripts/build-ai.mjs` writes `generated/` from the component READMEs, sources and docs. The repo's `.mcp.json` points at `dist/mcp.js` for local work.

## Release (automatic)

Commits on `main` follow [Conventional Commits](https://www.conventionalcommits.org/). `release.yml` runs semantic-release:

| commit | release |
|---|---|
| `fix: …` | patch |
| `feat: …` | minor |
| `feat!: …` / `BREAKING CHANGE:` | major |
| `chore:`, `docs:`, `ci:` | none |

It tags `vX.Y.Z`, publishes to GitHub Packages and writes the GitHub release. `pages.yml` deploys the demo to GitHub Pages at <https://ui.xdev.asia>.

## License

[Apache-2.0](LICENSE). Section 6 of the license grants no rights to the xDev name or logo.
