/**
 * MCP server for @xdev-asia/ui: lets coding agents read the components, props,
 * rules, tokens, icons and brand guidance of the xDev design system.
 * stdio only, read-only, no network. Bin: `xdev-ui-mcp`.
 */
import { McpServer, ProtocolError, ProtocolErrorCode, ResourceTemplate } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { loadManifest, type ComponentDoc, type SkillDoc, type TokenDoc } from "./manifest";

const M = loadManifest();
const CHARACTER_LIMIT = 25_000;
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;
const GROUPS = [...new Set(M.components.map((c) => c.group))];
const CATEGORIES = [...new Set(M.tokens.map((t) => t.category))];
const SKILL_NAMES = M.skills.map((s) => s.name);
const TOPICS = ["setup", ...Object.keys(M.guidelines)];

const Format = z.enum(["markdown", "json"]).default("markdown").describe("'markdown' for reading, 'json' for structured data");

type Result = { content: { type: "text"; text: string }[]; structuredContent?: Record<string, unknown>; isError?: boolean };
const text = (t: string): Result => ({ content: [{ type: "text", text: t }] });
const json = (data: Record<string, unknown>): Result => ({
  content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  structuredContent: data,
});
const fail = (t: string): Result => ({ content: [{ type: "text", text: t }], isError: true });

function findComponent(name: string): ComponentDoc | undefined {
  const n = name.trim().toLowerCase().replace(/[^a-z]/g, "");
  return M.components.find((c) => c.name.toLowerCase() === n);
}

function suggest(name: string, options: string[]): string {
  const n = name.toLowerCase();
  const close = options.filter((o) => o.toLowerCase().includes(n) || n.includes(o.toLowerCase()));
  return close.length ? ` Did you mean ${close.join(", ")}?` : "";
}

function tokenValue(t: TokenDoc): string {
  if (typeof t.value === "string") return t.value;
  return Object.entries(t.value as Record<string, unknown>)
    .map(([k, v]) => `${k} ${String(v)}`)
    .join(", ");
}

function componentMarkdown(c: ComponentDoc): string {
  return [
    c.readme.trim(),
    "",
    "## Import",
    "```ts",
    c.import,
    "```",
    "",
    "## Exported types",
    "```ts",
    c.types || "// no exported types",
    "```",
    "",
    `CSS classes: ${c.classes.map((k) => `\`.${k}\``).join(" ") || "none"}`,
  ].join("\n");
}

function findSkill(name: string): SkillDoc | undefined {
  return M.skills.find((s) => s.name === name.trim().toLowerCase());
}

function clip(t: string): string {
  return t.length <= CHARACTER_LIMIT ? t : `${t.slice(0, CHARACTER_LIMIT)}\n\n[cut at ${CHARACTER_LIMIT} characters]`;
}

function skillMarkdown(s: SkillDoc): string {
  return `# ${s.name}\n\n${s.description}\n\n${s.body}\n\n## Files\n\n${s.files.map((f) => `- ${f.path}`).join("\n")}\n\nRead one with xdevui_get_skill name="${s.name}" file="<path>".`;
}

function guideline(topic: string): string | undefined {
  if (topic === "setup") return `# Setup\n\n\`\`\`\n${M.setup}\n\`\`\`\n\nThemes: ${M.themes.join(", ")} (dark is the default).\n\n# Shared types\n\n\`\`\`ts\n${M.sharedTypes.trim()}\n\`\`\``;
  return M.guidelines[topic];
}

function createServer(): McpServer {
  const server = new McpServer(
    { name: "xdev-ui-mcp-server", version: M.version },
    {
      instructions: `Design system ${M.package} (React 19, dark-first). Before writing UI with it: xdevui_get_guidelines topic="setup" once, xdevui_list_components to pick parts, xdevui_get_component for each part you use (props + rules), xdevui_search_tokens instead of raw colours or px. Never invent props, class names or tokens that these tools do not return.`,
    },
  );

  server.registerTool(
    "xdevui_list_components",
    {
      title: "List components",
      description: `List the ${M.components.length} components of ${M.package} with their group and one-line purpose.

Use first to choose components for a screen, then xdevui_get_component for props and rules.
Examples:
  - "what can show agent status?" -> group="Status"
  - "all components" -> no arguments`,
      inputSchema: z.strictObject({
        group: z.enum(GROUPS as [string, ...string[]]).optional().describe(`Filter by group: ${GROUPS.join(", ")}`),
        response_format: Format,
      }),
      annotations: READ_ONLY,
    },
    async ({ group, response_format }) => {
      const list = M.components.filter((c) => !group || c.group === group);
      if (response_format === "json") {
        return json({ count: list.length, components: list.map(({ name, group, summary }) => ({ name, group, summary })) });
      }
      const byGroup = GROUPS.filter((g) => list.some((c) => c.group === g)).map(
        (g) => `## ${g}\n${list.filter((c) => c.group === g).map((c) => `- **${c.name}**: ${c.summary}`).join("\n")}`,
      );
      return text(`# ${M.package} ${M.version}: ${list.length} components\n\n${byGroup.join("\n\n")}\n\nNext: xdevui_get_component name="<Name>".`);
    },
  );

  server.registerTool(
    "xdevui_get_component",
    {
      title: "Get component",
      description: `Get one component: its README (variants, rules, example), the import line, its exported TypeScript props verbatim, and the CSS classes it renders.

Call this before using a component; use only the props listed here.
Examples:
  - name="Button"
  - name="command-palette" (case and dashes are ignored)`,
      inputSchema: z.strictObject({
        name: z.string().min(2).max(40).describe(`Component name, e.g. "TabStrip". One of: ${M.components.map((c) => c.name).join(", ")}`),
        response_format: Format,
      }),
      annotations: READ_ONLY,
    },
    async ({ name, response_format }) => {
      const c = findComponent(name);
      if (!c) {
        return fail(`No component "${name}".${suggest(name, M.components.map((x) => x.name))} Call xdevui_list_components for the full list.`);
      }
      return response_format === "json" ? json({ ...c }) : text(componentMarkdown(c));
    },
  );

  server.registerTool(
    "xdevui_search_tokens",
    {
      title: "Search tokens",
      description: `Search design tokens (CSS custom properties and type styles) by name or usage text. Returns the token, how to write it in CSS, its value per theme and when to use it.

Use instead of hard-coded colours, spacing, radii or font sizes.
Examples:
  - "focus ring colour" -> query="focus"
  - "spacing scale" -> category="spacing"
  - "danger text in light theme" -> query="danger"`,
      inputSchema: z.strictObject({
        query: z.string().max(80).optional().describe("Words matched against token name and usage, e.g. 'hairline', 'accent', 'menu'"),
        category: z.enum(CATEGORIES as [string, ...string[]]).optional().describe(`One of: ${CATEGORIES.join(", ")}`),
        limit: z.number().int().min(1).max(100).default(30).describe("Maximum tokens to return"),
        offset: z.number().int().min(0).default(0).describe("Tokens to skip, for pagination"),
        response_format: Format,
      }),
      annotations: READ_ONLY,
    },
    async ({ query, category, limit, offset, response_format }) => {
      const words = (query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
      const hits = M.tokens.filter(
        (t) =>
          (!category || t.category === category) &&
          words.every((w) => `${t.name} ${t.usage} ${t.category}`.toLowerCase().includes(w)),
      );
      if (hits.length === 0) {
        return text(`No tokens match${query ? ` "${query}"` : ""}${category ? ` in ${category}` : ""}. Try one word, or a category: ${CATEGORIES.join(", ")}.`);
      }
      const render = (n: number) => {
        const page = hits.slice(offset, offset + n);
        const next = offset + page.length;
        const meta = { total: hits.length, count: page.length, offset, has_more: next < hits.length, ...(next < hits.length ? { next_offset: next } : {}) };
        if (response_format === "json") {
          const data = { ...meta, tokens: page };
          return { data, out: JSON.stringify(data, null, 2) };
        }
        const rows = page.map((t) => `| \`${t.css}\` | ${t.category} | ${tokenValue(t)} | ${t.usage} |`);
        const more = meta.has_more ? `\n\nMore: call again with offset=${next}.` : "";
        return { data: meta, out: `Showing ${page.length} of ${hits.length}.\n\n| use | category | value | usage |\n|---|---|---|---|\n${rows.join("\n")}${more}` };
      };
      let n = limit;
      let r = render(n);
      while (n > 1 && r.out.length > CHARACTER_LIMIT) r = render((n = Math.ceil(n / 2)));
      return response_format === "json" ? { content: [{ type: "text", text: r.out }], structuredContent: r.data } : text(r.out);
    },
  );

  server.registerTool(
    "xdevui_get_guidelines",
    {
      title: "Get guidelines",
      description: `Get design-system guidance as markdown.

Topics: ${TOPICS.join(", ")}.
  - setup: install, CSS imports, theme attribute, shared types (SessionState, PrState, ...)
  - content-fundamentals: voice, labels, bilingual en/vi rules
  - visual-foundations: token layers, spacing, radius, accent, motion, type rules
  - iconography, brand: icon grid and logo v12 rules
Use topic="all" only when you need everything at once.`,
      inputSchema: z.strictObject({
        topic: z.enum(["all", ...TOPICS] as [string, ...string[]]).describe("Which section to return"),
      }),
      annotations: READ_ONLY,
    },
    async ({ topic }) => {
      if (topic === "all") return text(TOPICS.map((t) => guideline(t)).join("\n\n---\n\n"));
      return text(guideline(topic) ?? `Unknown topic. Use one of: ${TOPICS.join(", ")}.`);
    },
  );

  server.registerTool(
    "xdevui_list_icons",
    {
      title: "List icons",
      description: `List the icon names accepted by <Icon name>, Button icon, IconButton icon and the ActivityBar. Line icons on a 24 grid, stroke currentColor 1.75; 16px in controls, 20px in banners, 22px in the activity bar.`,
      inputSchema: z.strictObject({}),
      outputSchema: z.object({ icons: z.array(z.string()) }),
      annotations: READ_ONLY,
    },
    async () => json({ icons: M.icons }),
  );

  server.registerTool(
    "xdevui_search_docs",
    {
      title: "Search docs",
      description: `Full-text search over every component README and guideline. Returns matching lines with their source, so you can find which component or rule covers a topic.

Examples:
  - "which component shows keyboard shortcuts?" -> query="shortcut"
  - "rules for destructive actions" -> query="danger"
Use xdevui_get_component or xdevui_get_guidelines to read a whole source.`,
      inputSchema: z.strictObject({
        query: z.string().min(2).max(80).describe("Word or phrase, case-insensitive"),
        limit: z.number().int().min(1).max(50).default(20).describe("Maximum matching lines"),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      const q = query.toLowerCase();
      const sources: [string, string][] = [
        ...M.components.map((c): [string, string] => [`component:${c.name}`, c.readme]),
        ...Object.entries(M.guidelines).map(([k, v]): [string, string] => [`guideline:${k}`, v]),
      ];
      const hits: string[] = [];
      for (const [src, body] of sources) {
        for (const line of body.split("\n")) {
          if (line.toLowerCase().includes(q)) hits.push(`- [${src}] ${line.trim()}`);
        }
      }
      if (hits.length === 0) return text(`Nothing matches "${query}". Try a shorter word, or xdevui_list_components.`);
      const shown = hits.slice(0, limit);
      return text(`${hits.length} matching lines${hits.length > limit ? `, showing ${limit}` : ""}:\n\n${shown.join("\n")}`);
    },
  );

  server.registerTool(
    "xdevui_get_skill",
    {
      title: "Get skill",
      description: `Read an agent skill that ships with ${M.package}: ${SKILL_NAMES.join(", ")}.

  - no arguments: list the skills with their descriptions
  - name: the skill's SKILL.md and the list of its files
  - name and file: one file of the skill, e.g. file="references/resource-list.md" or a template file
Use xdev-ui-build-app to start an app, xdev-ui-admin for back-office screens and xdev-ui-review to audit a UI.`,
      inputSchema: z.strictObject({
        name: z.string().max(40).optional().describe(`Skill name, one of: ${SKILL_NAMES.join(", ")}`),
        file: z.string().max(200).optional().describe("Path inside the skill, from the file list, e.g. references/setup.md"),
      }),
      annotations: READ_ONLY,
    },
    async ({ name, file }) => {
      if (!name) {
        if (file) return fail("Pass name together with file.");
        return text(SKILL_NAMES.length ? `# Skills\n\n${M.skills.map((s) => `- **${s.name}**: ${s.description}`).join("\n")}\n\nNext: xdevui_get_skill name="<name>".` : "This build ships no skills.");
      }
      const s = findSkill(name);
      if (!s) return fail(`No skill "${name}". Available: ${SKILL_NAMES.join(", ")}.`);
      if (!file) return text(clip(skillMarkdown(s)));
      const f = s.files.find((x) => x.path === file.replace(/^\.?\//, ""));
      if (!f) return fail(`No file "${file}" in ${s.name}. Files: ${s.files.map((x) => x.path).join(", ")}.`);
      return text(clip(f.text));
    },
  );

  // Resources: the same data for clients that attach context instead of calling tools.
  server.registerResource(
    "component",
    new ResourceTemplate("xdev-ui://components/{name}", {
      list: async () => ({
        resources: M.components.map((c) => ({ uri: `xdev-ui://components/${c.name}`, name: c.name, description: c.summary, mimeType: "text/markdown" })),
      }),
    }),
    { title: "Component", description: "README, props and classes of one component", mimeType: "text/markdown" },
    async (uri, { name }) => {
      const c = findComponent(String(name));
      if (!c) throw new ProtocolError(ProtocolErrorCode.InvalidParams, `Unknown component "${String(name)}"`);
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text: componentMarkdown(c) }] };
    },
  );

  server.registerResource(
    "guideline",
    new ResourceTemplate("xdev-ui://guidelines/{topic}", {
      list: async () => ({
        resources: TOPICS.map((t) => ({ uri: `xdev-ui://guidelines/${t}`, name: t, mimeType: "text/markdown" })),
      }),
    }),
    { title: "Guideline", description: "One section of the design-system guidance", mimeType: "text/markdown" },
    async (uri, { topic }) => {
      const body = guideline(String(topic));
      if (!body) throw new ProtocolError(ProtocolErrorCode.InvalidParams, `Unknown topic "${String(topic)}"; use ${TOPICS.join(", ")}`);
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text: body }] };
    },
  );

  server.registerResource(
    "skill",
    new ResourceTemplate("xdev-ui://skills/{name}", {
      list: async () => ({
        resources: M.skills.map((sk) => ({ uri: `xdev-ui://skills/${sk.name}`, name: sk.name, description: sk.description, mimeType: "text/markdown" })),
      }),
    }),
    { title: "Skill", description: "SKILL.md and file list of one agent skill", mimeType: "text/markdown" },
    async (uri, { name }) => {
      const sk = findSkill(String(name));
      if (!sk) throw new ProtocolError(ProtocolErrorCode.InvalidParams, `Unknown skill "${String(name)}"; use ${SKILL_NAMES.join(", ")}`);
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text: clip(skillMarkdown(sk)) }] };
    },
  );

  server.registerResource(
    "tokens",
    "xdev-ui://tokens",
    { title: "Tokens", description: "Every design token with values per theme and usage", mimeType: "application/json" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(M.tokens, null, 2) }] }),
  );

  server.registerPrompt(
    "xdevui_build_ui",
    {
      title: "Build UI with xdev-ui",
      description: "Plan and write a screen or component using only xdev-ui parts, tokens and rules",
      argsSchema: z.object({ task: z.string().describe("What to build, e.g. 'settings dialog for branch prefix'") }),
    },
    async ({ task }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Build this with ${M.package}: ${task}

1. xdevui_get_guidelines topic="setup", then topic="visual-foundations" and "content-fundamentals".
2. xdevui_list_components; pick the parts.
3. xdevui_get_component for each part; use only the props and classes it returns.
4. xdevui_search_tokens for every colour, space, radius and type size; no raw hex or px values.
5. Write the code, then check it against each component's Rules section.`,
          },
        },
      ],
    }),
  );

  const skillPrompt = (name: string, title: string, description: string, what: string, create: string) =>
    server.registerPrompt(
      name,
      { title, description, argsSchema: z.object({ task: z.string().describe(what) }) },
      async ({ task }) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `${task}

1. xdevui_get_skill name="${create}" and follow its steps.
2. Scaffold with \`xdev-ui-skills create ${create === "xdev-ui-admin" ? "admin" : "app"} <dir>\` when the project is new.
3. xdevui_get_component for every part you use; only the props it returns. xdevui_search_tokens for every colour, space and type size.
4. Run \`node <skill-dir>/scripts/audit.mjs src --i18n src/i18n\` from the xdev-ui-review skill and fix every error.`,
            },
          },
        ],
      }),
    );
  skillPrompt("xdevui_build_app", "Build an app with xdev-ui", "Start or extend an app: shell, theme, i18n, routing and states", "What to build, e.g. 'notes app with a settings page'", "xdev-ui-build-app");
  skillPrompt("xdevui_build_admin", "Build admin screens with xdev-ui", "Build a console, dashboard or CRUD screen", "What to build, e.g. 'invoices list with filters and a detail page'", "xdev-ui-admin");

  return server;
}

serveStdio(createServer);
console.error(`xdev-ui-mcp-server ${M.version} on stdio (${M.components.length} components, ${M.tokens.length} tokens)`);
