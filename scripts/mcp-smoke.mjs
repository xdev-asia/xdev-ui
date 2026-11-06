// Starts dist/mcp.js over stdio, calls every tool, resource and prompt, exits non-zero on failure.
import { strict as assert } from "node:assert";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const client = new Client({ name: "xdev-ui-mcp-smoke", version: "1.0.0" });
await client.connect(new StdioClientTransport({ command: process.execPath, args: [process.env.MCP_BIN ?? "dist/mcp.js"] }));

const call = async (name, args = {}) => {
  const r = await client.callTool({ name, arguments: args });
  return { ...r, body: r.content.map((c) => c.text).join("\n") };
};

const { tools } = await client.listTools();
assert.deepEqual(tools.map((t) => t.name).sort(), [
  "xdevui_get_component",
  "xdevui_get_guidelines",
  "xdevui_get_skill",
  "xdevui_list_components",
  "xdevui_list_icons",
  "xdevui_search_docs",
  "xdevui_search_tokens",
]);
for (const t of tools) assert.equal(t.annotations?.readOnlyHint, true, `${t.name} should be read-only`);

const list = await call("xdevui_list_components", { response_format: "json" });
assert.equal(list.structuredContent.count, 69);

const button = await call("xdevui_get_component", { name: "button" });
assert.ok(!button.isError && button.body.includes("export interface ButtonProps"), "Button props missing");
const palette = await call("xdevui_get_component", { name: "command-palette" });
assert.ok(!palette.isError && palette.body.includes("CommandPalette"));
const missing = await call("xdevui_get_component", { name: "Carousel" });
assert.equal(missing.isError, true);

const focus = await call("xdevui_search_tokens", { query: "focus", response_format: "json" });
assert.ok(focus.structuredContent.tokens.some((t) => t.name === "x-color-signal"), "focus token missing");
const spacing = await call("xdevui_search_tokens", { category: "spacing", limit: 2 });
assert.ok(spacing.body.includes("offset=2"), "pagination hint missing");

const setup = await call("xdevui_get_guidelines", { topic: "setup" });
assert.ok(setup.body.includes("styles.css"));
const icons = await call("xdevui_list_icons");
assert.ok(icons.structuredContent.icons.includes("terminal"));
const docs = await call("xdevui_search_docs", { query: "stripe" });
assert.ok(docs.body.includes("guideline:"));
const skillDocs = await call("xdevui_search_docs", { query: "skill" });
assert.ok(skillDocs.body.includes("guideline:agent-skills"), "agent-skills guideline missing from search");
for (const topic of ["layout", "data-and-forms", "agent-skills"]) {
  const g = await call("xdevui_get_guidelines", { topic });
  assert.ok(!g.isError && g.body.length > 200, `guideline ${topic} missing`);
}
const invalid = await call("xdevui_search_docs", { query: "x" });
assert.equal(invalid.isError, true, "one-character query should be rejected");

const skills = await call("xdevui_get_skill");
assert.ok(["xdev-ui-admin", "xdev-ui-build-app", "xdev-ui-review", "xdev-ui-ux-standards"].every((n) => skills.body.includes(n)), "skill list incomplete");
const skill = await call("xdevui_get_skill", { name: "xdev-ui-admin" });
assert.ok(!skill.isError && skill.body.includes("references/resource-list.md"));
const skillFile = await call("xdevui_get_skill", { name: "xdev-ui-admin", file: "references/resource-list.md" });
assert.ok(!skillFile.isError && skillFile.body.includes("# Resource list"));
assert.equal((await call("xdevui_get_skill", { name: "xdev-ui-nope" })).isError, true, "unknown skill should be an error");
assert.equal((await call("xdevui_get_skill", { name: "xdev-ui-admin", file: "nope.md" })).isError, true, "unknown file should be an error");

const { resources } = await client.listResources();
assert.ok(resources.some((r) => r.uri === "xdev-ui://components/Dialog"));
assert.ok(resources.some((r) => r.uri === "xdev-ui://skills/xdev-ui-admin"));
const skillRes = await client.readResource({ uri: "xdev-ui://skills/xdev-ui-admin" });
assert.ok(skillRes.contents[0].text.includes("# xdev-ui-admin"));
const res = await client.readResource({ uri: "xdev-ui://guidelines/brand" });
assert.ok(res.contents[0].text.includes("xDev"));

const { prompts } = await client.listPrompts();
assert.deepEqual(prompts.map((p) => p.name).sort(), ["xdevui_build_admin", "xdevui_build_app", "xdevui_build_ui"]);
const prompt = await client.getPrompt({ name: "xdevui_build_ui", arguments: { task: "settings dialog" } });
assert.ok(prompt.messages[0].content.text.includes("settings dialog"));

const appPrompt = await client.getPrompt({ name: "xdevui_build_app", arguments: { task: "notes app" } });
assert.ok(appPrompt.messages[0].content.text.includes("notes app") && appPrompt.messages[0].content.text.includes("xdev-ui-build-app"));

await client.close();
console.log(`mcp ok: ${tools.length} tools, ${resources.length} resources, ${prompts.length} prompts`);
