// Smoke test: server-render every export from dist with react-dom/server.
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as X from "../dist/index.js";

const cases = {
  Button: [{}, "Create session"],
  IconButton: [{ icon: "search", label: "Search" }],
  Segmented: [{ options: [{ value: "a", label: "A" }, { value: "b", label: "B" }] }],
  Select: [{ options: [{ value: "en", label: "English" }] }],
  Field: [{ label: "Branch", hint: "kebab-case" }],
  Switch: [{ label: "Auto-commit" }],
  Kbd: [{}, "Ctrl"],
  Badge: [{ status: "new" }, "new"],
  Tag: [{ tone: "warn" }, "dirty"],
  AgentChip: [{ profile: "claude" }],
  DiffStat: [{ added: 3, removed: 1 }],
  StatusDot: [{ state: "working", pulse: true, label: "Working" }],
  Meter: [{ value: 82, label: "Context", warnAt: 80 }],
  Banner: [{ title: "Agent paused" }, "Waiting for input"],
  Toast: [{ actionLabel: "Undo", onDismiss() {} }, "Session archived"],
  TabStrip: [{ tabs: [{ id: "a", name: "fix-auth", state: "working", profile: "codex", color: 2 }] }],
  ActivityBar: [{ changeCount: 120 }],
  StatusBar: [{ items: ["main", "spacer", "UTF-8"] }],
  Menu: [{ items: [{ label: "Open" }, { type: "separator" }, { label: "Kill", danger: true }] }],
  Dialog: [{ title: "Kill session?" }, "Uncommitted changes stay in the worktree."],
  CommandPalette: [{ sections: [{ title: "Sessions", rows: [{ title: "fix-auth", state: "done" }] }] }],
  BrandMark: [{ variant: "lockup", size: 32 }],
  Icon: [{ name: "terminal" }],
};
let fail = 0;
for (const [name, [props, child]] of Object.entries(cases)) {
  try {
    const html = renderToStaticMarkup(h(X[name], props, child));
    if (!html.length) throw new Error("empty");
  } catch (e) {
    fail++;
    console.error(`FAIL ${name}: ${e.message}`);
  }
}
const missing = Object.keys(cases).filter((n) => typeof X[n] !== "function");
if (missing.length) { console.error("missing exports", missing); fail++; }
console.log(`${Object.keys(cases).length - fail}/${Object.keys(cases).length} components render`);
process.exit(fail ? 1 : 0);
