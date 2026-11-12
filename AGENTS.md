# AGENTS.md

Instructions for coding agents that **use** `@xdev-asia/ui` or **change** this repo.

## Using the library

Read the design system through the bundled MCP server instead of guessing props or colours.

```jsonc
// .mcp.json (Claude Code, Cursor, VS Code): package installed in the project
{
  "mcpServers": {
    "xdev-ui": { "command": "node", "args": ["node_modules/@xdev-asia/ui/dist/mcp.js"] }
  }
}
```

| tool | use it to |
|---|---|
| `xdevui_get_guidelines` `topic="setup"` | install, CSS imports, `data-theme`, shared types |
| `xdevui_list_components` | pick parts for a screen (106, grouped) |
| `xdevui_get_component` | README rules + exported props + CSS classes of one part |
| `xdevui_search_tokens` | find the token for a colour, space, radius or type size |
| `xdevui_list_icons` | valid `IconName` values |
| `xdevui_search_docs` | find which component or rule covers a topic |
| `xdevui_get_skill` | read a skill (`xdev-ui-build-app`, `xdev-ui-admin`, `xdev-ui-review`, `xdev-ui-ux-standards`) and its references |

Prompt `xdevui_build_ui` runs those steps in order; `xdevui_build_app` and `xdevui_build_admin` do the same through a skill and its template. Without MCP: `node_modules/@xdev-asia/ui/dist/llms-full.txt` (or <https://ui.xdev.asia/llms-full.txt>) holds the same content in one file.

### Skills

`npx xdev-ui-skills install` copies `xdev-ui-build-app`, `xdev-ui-admin`, `xdev-ui-review` and `xdev-ui-ux-standards` into `.claude/skills` (`--codex` or `--cursor`: `.agents/skills`; `--user`: your home). `npx xdev-ui-skills create app|admin <dir>` scaffolds a project. Run the review skill's `scripts/audit.mjs src --i18n src/i18n` before you finish UI work.

### Rules agents break most

- Import `@xdev-asia/ui/styles.css` once; set `data-theme="dark"` (default) or `"light"` on `<html>`.
- Use only props that `xdevui_get_component` returns. No raw hex, px or font sizes: use `var(--token)`.
- One primary `Button` per surface, last in `.dialog-actions`. Cyan `--x-color-signal` is the focus ring only.
- State is a tint, a 1px border or a `StatusDot`. **Never** a coloured left stripe on a rounded card or row.
- Labels: sentence case verbs ("Create session"), no emoji, no exclamation marks; ship `en` and `vi`.
- Brand mark: use `BrandMark` or `@xdev-asia/ui/brand/*`; never recolour the orange cursor `#ff7a3d`.

## Changing this repo

```bash
corepack pnpm install
corepack pnpm dev         # demo, http://localhost:5173
corepack pnpm build       # tokens -> ai manifest -> lib -> mcp.js -> d.ts
corepack pnpm test        # SSR smoke (106 components) + MCP smoke (all tools)
```

| change | also update |
|---|---|
| new component `X` | `src/components/X/X.tsx` + `README.md` (first paragraph = summary, `## Rules`), export in `src/index.ts`, row in the Components table of `docs/design-system.md` (build fails without it), CSS in `src/styles/<group>.css`, preview in `demo/previews.ts` |
| token | `tokens/tokens.json` only; `tokens.css` and the AI manifest are generated |
| skill or template | `skills/<name>/SKILL.md` (frontmatter `name`, `description`, `license`; body at most 150 lines), `references/`, `templates/`; every name it uses must exist (`test/skills-names.test.ts`); dotfiles in templates are `_npmrc`, `_gitignore`, `_mcp.json` |
| admin example | `examples/admin`; `test/app-rules.test.ts` runs the audit on it, and `pnpm build:example:admin` runs in CI |
| icon | `src/icons.ts` (24 grid, stroke 1.75, no fills) |
| rule or voice | `docs/design-system.md`; the MCP `xdevui_get_guidelines` reads its `##` sections |

- Generated, not committed: `src/styles/tokens.css`, `generated/` (`ai-manifest.json`, `llms.txt`, `llms-full.txt`), `dist/`.
- `src/mcp/server.ts` must not write to stdout (stdio protocol). Log with `console.error`.
- Commits follow Conventional Commits; `main` releases automatically (`fix` patch, `feat` minor, `!` major).
