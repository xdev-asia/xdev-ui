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
  "xdevui_list_components",
  "xdevui_list_icons",
  "xdevui_search_docs",
  "xdevui_search_tokens",
]);
for (const t of tools) assert.equal(t.annotations?.readOnlyHint, true, `${t.name} should be read-only`);

const list = await call("xdevui_list_components", { response_format: "json" });
assert.equal(list.structuredContent.count, 48);

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
const invalid = await call("xdevui_search_docs", { query: "x" });
assert.equal(invalid.isError, true, "one-character query should be rejected");

const { resources } = await client.listResources();
assert.ok(resources.some((r) => r.uri === "xdev-ui://components/Dialog"));
const res = await client.readResource({ uri: "xdev-ui://guidelines/brand" });
assert.ok(res.contents[0].text.includes("xDev"));

const { prompts } = await client.listPrompts();
assert.deepEqual(prompts.map((p) => p.name), ["xdevui_build_ui"]);
const prompt = await client.getPrompt({ name: "xdevui_build_ui", arguments: { task: "settings dialog" } });
assert.ok(prompt.messages[0].content.text.includes("settings dialog"));

await client.close();
console.log(`mcp ok: ${tools.length} tools, ${resources.length} resources, 1 prompt`);
