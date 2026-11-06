// Smoke test: server-render every export from dist with react-dom/server.
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as X from "../dist/index.js";

const cases = {
  Button: [{}, "Create session"],
  IconButton: [{ icon: "search", label: "Search" }],
  Segmented: [{ options: [{ value: "a", label: "A" }, { value: "b", label: "B" }] }],
  ThemeSwitch: [{ value: "system", onChange() {} }],
  Select: [{ options: [{ value: "en", label: "English" }] }],
  FontField: [{ value: "Inter", onChange() {} }],
  Field: [{ label: "Branch", hint: "kebab-case" }],
  Switch: [{ label: "Auto-commit" }],
  Kbd: [{}, "Ctrl"],
  Avatar: [{ name: "Duy Tran" }],
  PanZoom: [{ zoom: 1, x: 0, y: 0, label: "Image", onZoom() {}, onPan() {} }, "content"],
  ZoomBar: [{ zoom: 100, onZoomOut() {}, onFit() {}, onZoomIn() {}, onActual() {} }],
  Badge: [{ status: "new" }, "new"],
  Tag: [{ tone: "warn" }, "dirty"],
  AgentChip: [{ profile: "claude" }],
  DiffStat: [{ added: 3, removed: 1 }],
  Comment: [{ author: "Maya Chen", time: "2h ago" }, "Why this change?"],
  ReactionBar: [{ items: [{ key: "up", label: "Thumbs up", symbol: "+", count: 2, mine: true }], onToggle() {} }],
  StatusDot: [{ state: "working", pulse: true, label: "Working" }],
  Meter: [{ value: 82, label: "Context", warnAt: 80 }],
  Heatmap: [{ cells: [{ key: "a", level: 1, label: "A" }], label: "Tokens per day" }],
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
  FileIcon: [{ name: "package.json" }],
  Checkbox: [{ label: "Stage all files", hint: "Includes untracked" }],
  RadioGroup: [{ name: "shell", value: "bash", onChange() {}, options: [{ value: "bash", label: "bash" }, { value: "pwsh", label: "PowerShell" }] }],
  Textarea: [{ label: "Commit message", mono: true }],
  SearchInput: [{ value: "auth", onChange() {}, onClear() {}, count: 4 }],
  DatePicker: [{ label: "Due date", value: "2026-11-06", onChange() {}, today: "2026-11-06" }],
  DateRangePicker: [{ label: "Period", value: { start: "2026-11-02", end: "2026-11-12" }, onChange() {}, today: "2026-11-06", presets: [{ label: "This month", range: { start: "2026-11-01", end: "2026-11-30" } }], defaultOpen: true }],
  SearchPicker: [{ label: "Find work", value: "da", onValueChange() {}, onPick() {}, items: [{ id: "1", title: "Dark theme", meta: "#1" }], status: "1 match" }],
  Combobox: [{ label: "Cities", multiple: true, defaultOpen: true, value: ["hn"], onChange() {}, options: [{ value: "hn", label: "Hà Nội" }, { value: "dn", label: "Đà Nẵng" }] }],
  ActionTile: [{ icon: "swap", title: "Hand off a task", description: "Move ownership.", onClick() {} }],
  FilterChip: [{ pressed: true, count: 3 }, "Failed"],
  Tabs: [{ items: [{ id: "diff", label: "Diff" }, { id: "log", label: "Log", badge: 2 }] }],
  NavList: [{ title: "Settings", items: [{ id: "general", label: "General" }], value: "general", onSelect() {} }],
  Breadcrumb: [{ items: [{ label: "xdev" }, { label: "fix-auth", mono: true }] }],
  TreeView: [{ rows: [{ id: "src", depth: 0, name: "src", kind: "dir", open: true }, { id: "src/a.ts", depth: 1, name: "a.ts", kind: "file", mark: "modified" }] }],
  CommitGraph: [{ row: { input: [], output: [{ id: "b", color: 0 }], lane: 0, color: 0, kind: "commit" } }],
  Disclosure: [{ title: "Staged", count: 2 }, "a.ts"],
  ListRow: [{ title: "fix-auth", meta: "main", selected: true, onClick() {} }],
  Card: [{ title: "Worktree", subtitle: "~/code/xdev", monoSubtitle: true }, "Clean"],
  EmptyState: [{ icon: "changes", title: "No changes", hint: "Edits in this worktree show up here." }],
  SettingRow: [{ label: "Auto-commit", description: "Commit when an agent finishes.", controlId: "auto-commit" }],
  CodeBlock: [{ code: "npx -y -p @xdev-asia/ui xdev-ui-mcp", language: "bash" }],
  Spinner: [{ size: "sm" }],
  Skeleton: [{ lines: 2 }],
  Drawer: [{ title: "Edit", modal: false, onClose() {} }, "Body"],
  FormDialog: [{ title: "New user", modal: false, onSubmit() {}, onCancel() {} }],
  SaveBar: [{ dirty: true, onSave() {}, onDiscard() {} }],
  FileDrop: [{ label: "Files", onFiles() {} }],
  FieldMessage: [{ tone: "error" }, "Branch name is taken"],
  Popover: [{ open: true, onClose() {}, label: "Branch", trigger: "main" }, "Switch branch"],
  Tooltip: [{ content: "Copy path" }, h("button", { type: "button" }, "Copy")],
  SplitHandle: [{ direction: "horizontal", value: 240, min: 160, max: 420, onResize() {} }],
  Toolbar: [{ title: "Changes", count: 12, actions: h("button", { type: "button" }, "Stage all") }],
  Avatar: [{ name: "Trần Thị B" }],
  AppShell: [{ nav: h("nav", { "aria-label": "Main" }, "Overview"), crumbs: "Overview" }, "Page"],
  PageHeader: [{ title: "Users", description: "People who can sign in.", meta: "Active", actions: h("button", { type: "button" }, "Create user") }],
  FormSection: [{ title: "Profile", description: "Shown to teammates.", columns: 2, actions: h("button", { type: "button" }, "Save changes") }, h("input", { "aria-label": "Name" })],
  DescriptionList: [{ items: [{ term: "Email", value: "ada@example.com", mono: true }, { term: "Role", value: "Owner" }] }],
  StatTile: [{ label: "Active users", value: "1,284", delta: "+12%", deltaTrend: "up", deltaTone: "good", hint: "vs last 7 days" }],
  DataTable: [{ caption: "Users", rowKey: (r) => r.id, rows: [{ id: "1", name: "Ada" }], columns: [{ key: "name", header: "Name", sortable: true, cell: (r) => r.name }], selected: new Set(), onSelectedChange() {} }],
  FacetFilter: [{ label: "Role", options: [{ value: "a", label: "Admin" }], selected: ["a"], onChange() {}, defaultOpen: true }],
  BulkBar: [{ count: 2, onClear() {} }, "Delete"],
  Pagination: [{ page: 2, pageSize: 20, total: 57, onPageChange() {}, pageSizeOptions: [10, 20, 50], onPageSizeChange() {} }],
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
