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
<Button variant="primary" icon="plus">Create session</Button>
```

| export | content |
|---|---|
| `@xdev-asia/ui` | 91 components, `ICONS`, `ICON_NAMES`, prop types |
| `@xdev-asia/ui/image` | `ImageCropper`, `ImageField` and crop helpers; needs the optional peer `react-easy-crop` |
| `@xdev-asia/ui/styles.css` | tokens + component CSS |
| `@xdev-asia/ui/styles.layered.css` | the same stylesheet inside `@layer xdev`. With Tailwind v4 import it instead of `styles.css` and declare the order first, `@layer theme, base, xdev, components, utilities;`, so Tailwind utilities win over component classes |
| `@xdev-asia/ui/tailwind.css` | Tailwind v4 theme: colours, radii, fonts and breakpoints from the tokens |
| `@xdev-asia/ui/tokens.css` | tokens only (CSS custom properties, dark + light) |
| `@xdev-asia/ui/tokens.json` | token source |
| `@xdev-asia/ui/brand/*` | logo v9 SVG/PNG, mobile icons |
| `@xdev-asia/ui/ai-manifest.json` | components, props, classes, tokens, icons, guidelines as JSON |
| `@xdev-asia/ui/llms.txt`, `llms-full.txt` | the same for LLMs ([llmstxt.org](https://llmstxt.org)) |

Components: ActionTile, ActivityBar, AgentChip, AppShell, Avatar, Badge, Banner, BrandMark, Breadcrumb, Button, Card, Checkbox, Coachmark, CodeBlock, ColorField, CommandPalette, Comment, CommitGraph, DataTable, DescriptionList, Dialog, DiffStat, Disclosure, EmptyState, Field, FieldMessage, FileIcon, FilterChip, FontField, FormSection, Heatmap, Icon, IconButton, Kbd, ListRow, Menu, Meter, NavList, PageHeader, Pagination, PanZoom, Popover, RadioGroup, ReactionBar, SearchInput, SearchPicker, Segmented, Select, SettingRow, Spinner, SplitHandle, StatTile, StatusBar, StatusDot, StepDots, Switch, Tabs, TabStrip, Tag, Textarea, ThemeEditor, ThemePreview, ThemeSwitch, Toast, Toolbar, Tooltip, TreeView, ZoomBar. Rules per component: `src/components/<Name>/README.md`. Image components (`@xdev-asia/ui/image`, `pnpm add react-easy-crop`): `src/image/<Name>/README.md`; their CSS is in `styles.css`. Brand book: [docs/brand.md](docs/brand.md). Foundations: [docs/design-system.md](docs/design-system.md).

## Subpath entries

Optional parts live in their own entry points, so the core entry never loads their peers. Install the peers only where you import the subpath.

### `@xdev-asia/ui/editor`

`RichTextEditor`: article editor on Tiptap 3 (headings 2-3, bold, italic, links, lists, quotes, images), controlled, Markdown by default or HTML. Rules: `src/editor/RichTextEditor/README.md`.

```bash
pnpm add @tiptap/core @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extensions @tiptap/markdown
```

```tsx
import { RichTextEditor } from "@xdev-asia/ui/editor";

<RichTextEditor label="Body" value={body} onChange={setBody} onUploadImage={uploadImage} />
```

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
| `xdevui_list_components` | 91 components by group, with summary |
| `xdevui_get_component` | README rules, exported prop types, CSS classes, import line |
| `xdevui_search_tokens` | tokens by name, usage or category, with dark/light values |
| `xdevui_get_guidelines` | setup, voice, visual foundations, iconography, layout, data and forms, agent skills, brand |
| `xdevui_list_icons` | valid `IconName` values |
| `xdevui_search_docs` | matching sections across all docs |
| `xdevui_get_skill` | an agent skill: list, `SKILL.md` with its files, or one file |

Resources: `xdev-ui://components/{name}`, `xdev-ui://guidelines/{topic}`, `xdev-ui://skills/{name}`, `xdev-ui://tokens`. Prompts: `xdevui_build_ui`, `xdevui_build_app`, `xdevui_build_admin`. Agent rules: [AGENTS.md](AGENTS.md). No MCP client: <https://ui.xdev.asia/llms-full.txt>.

## Agent skills

Four skills teach a coding agent to build with the library: `xdev-ui-build-app` (app shell, theme, i18n, routing, states), `xdev-ui-admin` (dashboards, lists, forms, roles, settings, audit log), `xdev-ui-review` (rules audit) and `xdev-ui-ux-standards` (WCAG 2.2 AA, APG patterns, platform guidelines, usability heuristics). They live in `skills/` and ship in the package.

```bash
npx xdev-ui-skills install                 # .claude/skills in this project
npx xdev-ui-skills install --codex --user  # ~/.agents/skills
npx xdev-ui-skills create admin my-console # a Vite app from the admin template
```

Or in Claude Code: `/plugin marketplace add xdev-asia/xdev-ui`, then `/plugin install xdev-ui@xdev-asia`. `examples/admin` is a full console (sign-in, dashboard, users, roles, settings, audit log) in en and vi; run it with `pnpm example:admin`.

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
