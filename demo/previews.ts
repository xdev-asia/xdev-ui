// Generated from the design-system artifact previews. h = React.createElement, X = @xdev-asia/ui.
// @ts-nocheck
import * as React from "react";

export const previews: Record<string, { style: React.CSSProperties; render: (X: any, h: any) => any }> = {
  "ActivityBar": {
    style: {"padding": "16px", "height": "348px", "display": "flex"},
    render: (X, h) => {
    var el;
    el = h(X.ActivityBar, { active: "terminal", changeCount: 7 });
    return el;
    },
  },
  "AgentChip": {
    style: {"display": "flex", "gap": "12px", "flexWrap": "wrap", "alignItems": "center", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.AgentChip, { profile: "claude", title: "Claude" }),
      h(X.AgentChip, { profile: "codex", title: "Codex" }),
      h(X.AgentChip, { profile: "custom", letter: "G", title: "Custom profile" }));
    return el;
    },
  },
  "Comment": {
    style: {"display": "flex", "flexDirection": "column", "gap": "12px", "padding": "16px", "maxWidth": "420px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.Comment, { author: "Maya Chen", time: "2h ago", location: "src/app.ts:12" }, "Why this change?"),
      h(X.Comment, { author: "review-bot", bot: true, botLabel: "Bot", state: "resolved", stateLabel: "Resolved" }, "Looks fine."));
    return el;
    },
  },
  "RunTimeline": {
    style: {"padding": "16px", "maxWidth": "360px"},
    render: (X, h) => h(X.RunTimeline, { steps: [
      { id: "1", label: "Check out branch", status: "done", at: "14:02", durationMs: 1200 },
      { id: "2", label: "Run tests", status: "failed", at: "14:05", durationMs: 42000 },
      { id: "3", label: "Open pull request", status: "skipped" }] }),
  },
  "ReviewComment": {
    style: {"padding": "16px", "maxWidth": "420px"},
    render: (X, h) => h(X.ReviewComment, { file: "src/session.ts", line: 42, author: "Maya Chen", time: "2h ago", body: "This retry never gives up. Cap it.", suggestion: "for (let i = 0; i < MAX_RETRIES; i++) {", onResolve: function () {} }),
  },
  "SettingsShell": {
    style: {"padding": "16px", "height": "320px", "maxWidth": "720px"},
    render: (X, h) => h(X.SettingsShell, {
      groups: [{ id: "g", label: "General", items: [{ id: "appearance", label: "Appearance", keywords: ["theme"] }, { id: "language", label: "Language" }] }],
      value: "appearance", onChange: function () {}, query: "", onQuery: function () {},
    }, h(X.SettingRow, { id: "appearance", label: "Appearance", description: "Dark or light" })),
  },
  "AgentRow": {
    style: {"display": "flex", "flexDirection": "column", "gap": "8px", "padding": "16px", "maxWidth": "480px"},
    render: (X, h) => h(React.Fragment, null,
      h(X.AgentRow, { name: "Claude", cli: "claude", summary: "Sonnet 5.5 · work account", expanded: true, onToggle: function () {} }, "Profile form goes here."),
      h(X.AgentRow, { name: "Codex", cli: "codex", summary: "Default model", expanded: false, onToggle: function () {} })),
  },
  "ReactionBar": {
    style: {"display": "flex", "gap": "12px", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(X.ReactionBar, { onToggle: function () {}, items: [
      { key: "up", label: "Thumbs up", symbol: h(X.Icon, { name: "check-circle" }), count: 2, mine: true },
      { key: "heart", label: "Heart", symbol: h(X.Icon, { name: "star" }), count: 0, mine: false }] });
    return el;
    },
  },
  "Avatar": {
    style: {"display": "flex", "gap": "12px", "alignItems": "center", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.Avatar, { name: "Duy Tran", size: "sm" }),
      h(X.Avatar, { name: "Duy Tran" }),
      h(X.Avatar, { name: "Trần Đức Duy", size: "lg" }));
    return el;
    },
  },
  "PanZoom": {
    style: {"display": "flex", "height": "160px", "width": "320px", "padding": "16px"},
    render: (X, h) => h(X.PanZoom, { zoom: 1, x: 0, y: 0, label: "Preview", onZoom() {}, onPan() {} },
      h("div", { style: { width: 240, height: 120, background: "var(--x-color-surface-2)" } })),
  },
  "ZoomBar": {
    style: {"display": "flex", "gap": "12px", "alignItems": "center", "padding": "16px"},
    render: (X, h) => h(X.ZoomBar, { zoom: 100, onZoomOut() {}, onFit() {}, onZoomIn() {}, onActual() {} }),
  },
  "Badge": {
    style: {"display": "flex", "gap": "12px", "flexWrap": "wrap", "alignItems": "center", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.Badge, { status: "new" }, "new"),
      h(X.Badge, { status: "changed" }, "changed"),
      h(X.Badge, { status: "unchanged" }, "unchanged"),
      h(X.Badge, { status: "foreign" }, "foreign"),
      h(X.Badge, { tone: "danger" }, "failed"),
      h(X.Badge, null, "neutral"));
    return el;
    },
  },
  "Banner": {
    style: {"display": "flex", "flexDirection": "column", "gap": "12px", "alignItems": "flex-start", "padding": "16px", "width": "520px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.Banner, { title: "3 files are owned by another kit.", action: h(X.Button, { variant: "secondary" }, "Review") }, "They will be skipped when you sync."),
      h(X.Banner, { title: "Agent CLI not found on PATH." }),
      h(X.Banner, { tone: "info", title: "Exports run overnight." }),
      h(X.Banner, { tone: "ok", title: "All payments are reconciled." }),
      h(X.Banner, { tone: "danger", title: "Payment provider is down." }, "New orders fail until it is back."));
    return el;
    },
  },
  "BrandMark": {
    style: {"display": "flex", "gap": "32px", "flexWrap": "wrap", "alignItems": "center", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.BrandMark, { size: 32 }),
      h(X.BrandMark, { variant: "tile", size: 32 }),
      h(X.BrandMark, { variant: "lockup", size: 28 }));
    return el;
    },
  },
  "Button": {
    style: {"display": "flex", "gap": "12px", "flexWrap": "wrap", "alignItems": "center", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.Button, null, "Create session"),
      h(X.Button, { icon: "plus" }, "New tab"),
      h(X.Button, { variant: "secondary" }, "Cancel"),
      h(X.Button, { variant: "danger" }, "Delete"),
      h(X.Button, { variant: "ghost" }, "Show more"),
      h(X.Button, { variant: "link", href: "#" }, "Read the docs"),
      h(X.Button, { size: "sm", variant: "secondary" }, "Small"),
      h(X.Button, { disabled: true }, "Disabled"));
    return el;
    },
  },
  "CommandPalette": {
    style: {"padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(X.CommandPalette, {
      title: "Go to", defaultQuery: "auth",
      filters: ["All", "Sessions", "Files", "Commands"],
      sections: [
        { title: "Sessions", rows: [
          { title: "fix-auth-redirect", detail: "claude · working", state: "working" },
          { title: "auth-e2e", detail: "codex · waiting", state: "waiting" }
        ]},
        { title: "Files", rows: [
          { title: "src/auth/redirect.ts", detail: "apps/web", icon: "docs" },
          { title: "docs/auth.md", detail: "docs", icon: "docs" }
        ]},
        { title: "Commands", rows: [{ title: "Rotate auth token", detail: "Accounts", icon: "accounts" }] }
      ]
    });
    return el;
    },
  },
  "Dialog": {
    style: {"padding": "0", "position": "relative", "height": "244px"},
    render: (X, h) => {
    var el;
    el = h("div", { style: { position: "absolute", inset: 0 } }, h(X.Dialog, {
      title: "Kill session fix-auth-redirect?",
      confirmLabel: "Kill session", alert: true,
      onCancel: function () {}, onConfirm: function () {}
    }, "The agent stops at once. Uncommitted changes stay in the worktree."));
    return el;
    },
  },
  "Drawer": {
    style: {"padding": "0", "position": "relative", "height": "280px"},
    render: (X, h) => h(X.Drawer, { title: "Edit banner", description: "Shown at the top of the home page", modal: false, onClose: function () {},
      footer: h(React.Fragment, null, h(X.Button, { variant: "secondary" }, "Cancel"), h(X.Button, null, "Save")) },
      h(X.Field, { label: "Title", defaultValue: "Autumn sale" })),
  },
  "FileDrop": {
    style: {"padding": "16px", "width": "360px"},
    render: (X, h) => h(X.FileDrop, { label: "Attachments", accept: "image/*,.pdf", maxSize: 5242880, multiple: true, onFiles: function () {}, onRemove: function () {},
      items: [{ id: "1", name: "contract.pdf", size: 820000 }, { id: "2", name: "banner.png", size: 1400000, progress: 45 }] }),
  },
  "FormDialog": {
    style: {"padding": "0", "position": "relative", "height": "300px"},
    render: (X, h) => h("div", { style: { position: "absolute", inset: 0 } }, h(X.FormDialog, { title: "New user", description: "They receive an email to set a password.",
      submitLabel: "Create user", modal: false, onSubmit: function () {}, onCancel: function () {} }, h(X.Field, { label: "Email", type: "email" }))),
  },
  "SaveBar": {
    style: {"padding": "16px", "width": "520px"},
    render: (X, h) => h(X.SaveBar, { dirty: true, onSave: function () {}, onDiscard: function () {} }),
  },
  "Container": {
    style: {"padding": "16px 0", "width": "520px", "background": "var(--bg-2)"},
    render: (X, h) => h(X.Container, { size: "sm" }, h("div", { style: { padding: 12, background: "var(--bg-0)", borderRadius: 6 } }, "Container size sm: max 640px, 16px gutter")),
  },
  "Stack": {
    style: {"padding": "16px", "width": "420px"},
    render: (X, h) => h(X.Stack, { gap: 4 }, h(X.Field, { label: "Name" }), h(X.Field, { label: "Email", type: "email" }),
      h(X.Stack, { direction: "row", gap: 2, justify: "end" }, h(X.Button, { variant: "secondary" }, "Cancel"), h(X.Button, { variant: "primary" }, "Save"))),
  },
  "Grid": {
    style: {"padding": "16px", "width": "560px"},
    render: (X, h) => h(X.Grid, { columns: { base: 1, sm: 3 }, gap: 3, responsive: "container" },
      h(X.StatTile, { label: "Users", value: "1,284" }), h(X.StatTile, { label: "Orders", value: "312" }), h(X.StatTile, { label: "Revenue", value: "48.2M" }),
      h(X.GridItem, { span: "full" }, h(X.Banner, { tone: "info" }, "GridItem span=\"full\" takes the whole row."))),
  },
  "Skeleton": {
    style: {"display": "grid", "gap": "16px", "padding": "16px", "width": "320px"},
    render: (X, h) => h(React.Fragment, null, h(X.Skeleton, { shape: "circle", height: "32px" }), h(X.Skeleton, { lines: 3, announce: true }), h(X.Skeleton, { shape: "block" })),
  },
  "DiffStat": {
    style: {"display": "flex", "gap": "12px", "flexWrap": "wrap", "alignItems": "center", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.DiffStat, { added: 128, removed: 14 }),
      h(X.DiffStat, { added: 3, removed: 0 }),
      h(X.DiffStat, { added: 0, removed: 42 }));
    return el;
    },
  },
  "Field": {
    style: {"display": "flex", "flexDirection": "column", "gap": "12px", "alignItems": "flex-start", "padding": "16px", "width": "320px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.Field, { label: "Session name", placeholder: "fix-auth-redirect", hint: "Becomes the branch name." }),
      h(X.Field, { label: "Port", defaultValue: "80", error: "Pick a port above 1024." }));
    return el;
    },
  },
  "Icon": {
    style: {"display": "grid", "gridTemplateColumns": "repeat(7,72px)", "gap": "12px", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null, X.ICON_NAMES.map(function (n) {
      return h("div", { key: n, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "var(--text-1)" } },
        h(X.Icon, { name: n, size: 22 }),
        h("code", { style: { fontSize: 13, color: "var(--text-2)" } }, n));
    }));
    return el;
    },
  },
  "IconButton": {
    style: {"display": "flex", "gap": "12px", "flexWrap": "wrap", "alignItems": "center", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.IconButton, { icon: "plus", label: "New terminal" }),
      h(X.IconButton, { icon: "search", label: "Search" }),
      h(X.IconButton, { icon: "more", label: "More actions" }),
      h(X.IconButton, { icon: "close", label: "Close panel" }),
      h(X.IconButton, { icon: "plus", label: "Add (touch size)", size: "lg" }));
    return el;
    },
  },
  "Kbd": {
    style: {"display": "flex", "gap": "12px", "flexWrap": "wrap", "alignItems": "center", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.Kbd, null, "Ctrl"), h(X.Kbd, null, "K"),
      h("span", { style: { color: "var(--text-2)", fontSize: 12 } }, "Open palette"),
      h(X.Kbd, null, "Ctrl+Shift+P"), h(X.Kbd, null, "Esc"));
    return el;
    },
  },
  "Menu": {
    style: {"padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(X.Menu, { label: "Tab actions", items: [
      { label: "Rename", chord: "F2" },
      { label: "Duplicate", chord: "Ctrl+D", active: true },
      { label: "Colour", submenu: true, swatch: 6 },
      { type: "separator" },
      { type: "group", label: "View" },
      { label: "Show timestamps", checked: true },
      { label: "Wrap lines", checked: false },
      { label: "Split right", disabled: true },
      { type: "separator" },
      { label: "Kill session", danger: true, chord: "Ctrl+W" }
    ] });
    return h("div", { style: { display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" } },
      h(X.MenuButton, { label: "Row actions", items: [{ label: "Edit" }, { label: "Open profile", href: "#profile" }, { type: "separator" }, { label: "Delete", danger: true }] }),
      el);
    },
  },
  "Meter": {
    style: {"display": "flex", "flexDirection": "column", "gap": "12px", "alignItems": "flex-start", "padding": "16px", "width": "320px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.Meter, { label: "Context", value: 42, warnAt: 80 }),
      h(X.Meter, { label: "Context", value: 91, warnAt: 80 }),
      h(X.Meter, { label: "5h limit", value: 63 }));
    return el;
    },
  },
  "ThemeSwitch": {
    style: {"display": "flex", "flexDirection": "column", "gap": "12px", "alignItems": "flex-start", "padding": "16px"},
    render: (X, h) => h(X.ThemeSwitch, { value: "system", onChange: () => {} }),
  },
  "SwatchGroup": {
    style: {"padding": "16px"},
    render: (X, h) => h(X.SwatchGroup, { "aria-label": "Colour", value: "red", onChange: function () {}, options: [{ value: "red", label: "Red", tone: "danger" }, { value: "amber", label: "Amber", tone: "warning" }, { value: "blue", label: "Blue", tone: "accent" }, { value: "white", label: "White", tone: "neutral" }] }),
  },
  "PairingCode": {
    style: {"display": "flex", "flexDirection": "column", "gap": "12px", "padding": "16px", "maxWidth": "100%"},
    render: (X, h) => h(React.Fragment, null,
      h(X.PairingCode, { value: "7K4QM-2XD9P", label: "Pairing code", copyLabel: "Copy code", onCopy: function () {} }),
      h(X.PairingCode, { value: "482 913", groupSize: 3, size: "md", label: "Check code" })),
  },
  "CodeInput": {
    style: {"display": "flex", "flexDirection": "column", "gap": "12px", "padding": "16px", "width": "360px", "maxWidth": "100%"},
    render: (X, h) => h(React.Fragment, null,
      h(X.CodeInput, { length: 10, value: "7K4QM2", onChange: function () {}, label: "Pairing code" }),
      h(X.CodeInput, { length: 6, groupSize: 3, alphabet: "digits", value: "482913", invalid: true, onChange: function () {}, label: "Check code" })),
  },
  "Segmented": {
    style: {"display": "flex", "flexDirection": "column", "gap": "12px", "alignItems": "flex-start", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.Segmented, { label: "View", options: [{ value: "split", label: "Split" }, { value: "unified", label: "Unified" }] }),
      h(X.Segmented, { label: "Theme", defaultValue: "dark", options: [{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }] }));
    return el;
    },
  },
  "Select": {
    style: {"display": "flex", "gap": "12px", "flexWrap": "wrap", "alignItems": "center", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.Select, { "aria-label": "Language", defaultValue: "en", options: [{ value: "en", label: "English" }, { value: "vi", label: "Tiếng Việt" }] }),
      h(X.Select, { "aria-label": "Profile", options: [{ value: "claude", label: "Claude" }, { value: "codex", label: "Codex" }, { value: "custom", label: "Custom" }] }));
    return el;
    },
  },
  "StatusBar": {
    style: {"padding": "16px"},
    render: (X, h) => {
    var el;
    el = h("div", { style: { width: 720 } }, h(X.StatusBar, { items: [
      h(X.StatusDot, { key: 1, state: "working", label: "3 running", pulse: true }),
      h(X.StatusDot, { key: 2, state: "waiting", label: "1 waiting" }),
      "spacer",
      h(X.Meter, { key: 3, label: "Context", value: 42, warnAt: 80 }),
      h("code", { key: 4 }, "main"),
      "UTF-8"
    ] }));
    return el;
    },
  },
  "StatusDot": {
    style: {"display": "flex", "flexDirection": "column", "gap": "12px", "alignItems": "flex-start", "padding": "16px"},
    render: (X, h) => {
    var el;
    var row = function (title, items) {
      return h("div", { style: { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" } },
        h("span", { style: { width: 56, color: "var(--text-3)", fontSize: 11 } }, title), items);
    };
    el = h(React.Fragment, null,
      row("session", ["working", "waiting", "failed", "done", "idle", "exited"].map(function (s) { return h(X.StatusDot, { key: s, state: s, label: s, pulse: s === "working" }); })),
      row("PR", ["open", "draft", "merged", "closed"].map(function (s) { return h(X.StatusDot, { key: s, pr: s, label: s }); })),
      row("check", ["pass", "pending", "fail", "skipping", "cancel"].map(function (s) { return h(X.StatusDot, { key: s, check: s, label: s }); })));
    return el;
    },
  },
  "Switch": {
    style: {"display": "flex", "flexDirection": "column", "gap": "12px", "alignItems": "flex-start", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.Switch, { label: "Auto-accept edits", defaultChecked: true }),
      h(X.Switch, { label: "Notify when an agent waits" }),
      h(X.Switch, { label: "Disabled", disabled: true }));
    return el;
    },
  },
  "TabStrip": {
    style: {"padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(X.TabStrip, { label: "Terminals", tabs: [
      { id: "a", name: "fix-auth-redirect", state: "working", profile: "claude", color: 6 },
      { id: "b", name: "docs-i18n", state: "waiting", profile: "codex", color: 4, unread: true },
      { id: "c", name: "release.sh", dirty: true, color: 2 },
      { id: "d", name: "flaky-e2e", state: "failed", profile: "claude", color: 1 },
      { id: "e", name: "scratch", state: "idle", skipped: true }
    ] });
    return el;
    },
  },
  "Tag": {
    style: {"display": "flex", "gap": "12px", "flexWrap": "wrap", "alignItems": "center", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.Tag, null, "worktree"), h(X.Tag, null, "main"), h(X.Tag, null, "detached"),
      h(X.Tag, { tone: "warn" }, "uncommitted"),
      h(X.Tag, { onRemove: function () {}, removeLabel: "Remove flag" }, "--yolo"));
    return el;
    },
  },
  "Toast": {
    style: {"display": "flex", "flexDirection": "column", "gap": "12px", "alignItems": "flex-start", "padding": "16px"},
    render: (X, h) => {
    var el;
    el = h(React.Fragment, null,
      h(X.Toast, { actionLabel: "Undo", onAction: function () {}, onDismiss: function () {} }, "Session archived."),
      h(X.Toast, { onDismiss: function () {} }, "Copied branch name."),
      h(X.Toast, { tone: "danger", description: "The remote rejected the push.", onDismiss: function () {} }, "Push failed."),
      h(X.Button, { onClick: function () { X.toast("Settings saved.", { tone: "ok" }); } }, "toast()"),
      h(X.Toaster, null));
    return el;
    },
  },
  "Breadcrumb": {
    style: {"padding": "16px"},
    render: (X, h) => h(X.Breadcrumb, { items: [{ label: "xdev", href: "#" }, { label: "worktrees", href: "#" }, { label: "feat/login-retry", mono: true }] }),
  },
  "Card": {
    style: {"padding": "16px", "width": "360px"},
    render: (X, h) => h(X.Card, { title: "Worktree", subtitle: "feat/login-retry", monoSubtitle: true, actions: h(X.IconButton, { icon: "more", label: "More actions" }) },
      h(X.DiffStat, { added: 128, removed: 14 })),
  },
  "Checkbox": {
    style: {"display": "flex", "flexDirection": "column", "gap": "12px", "padding": "16px"},
    render: (X, h) => h(React.Fragment, null,
      h(X.Checkbox, { label: "Delete the branch too", defaultChecked: true }),
      h(X.Checkbox, { label: "Select all", indeterminate: true }),
      h(X.Checkbox, { label: "Keep worktree", hint: "Files stay on disk." })),
  },
  "CodeBlock": {
    style: {"padding": "16px", "width": "420px"},
    render: (X, h) => h(X.CodeBlock, { language: "bash", code: "pnpm add @xdev-asia/ui" }),
  },
  "CommitGraph": {
    style: {"padding": "16px"},
    render: (X, h) => h(X.CommitGraph, { row: X.graphRows([{ id: "a", parents: ["b", "c"] }])[0] }),
  },
  "Disclosure": {
    style: {"padding": "16px", "width": "320px"},
    render: (X, h) => h(X.Disclosure, { title: "Staged", count: 2 },
      h(X.ListRow, { title: "src/auth/retry.ts", meta: "modified" }),
      h(X.ListRow, { title: "src/auth/retry.test.ts", meta: "added" })),
  },
  "EmptyState": {
    style: {"padding": "16px", "width": "360px"},
    render: (X, h) => h(X.EmptyState, { size: "center", icon: "branch", title: "No worktrees yet", hint: "Create one to give an agent its own branch.", actions: h(X.Button, { icon: "plus" }, "New worktree") }),
  },
  "FieldMessage": {
    style: {"display": "flex", "flexDirection": "column", "gap": "10px", "padding": "16px"},
    render: (X, h) => h(React.Fragment, null,
      h(X.FieldMessage, { tone: "error" }, "Branch name is taken."),
      h(X.FieldMessage, { tone: "warn" }, "This deletes 3 files."),
      h(X.FieldMessage, { tone: "info" }, "Saved on this device only.")),
  },
  "ActionTile": {
    style: {"display": "grid", "gridTemplateColumns": "repeat(2, 1fr)", "gap": "8px", "padding": "16px", "width": "420px"},
    render: (X, h) => h(React.Fragment, null,
      h(X.ActionTile, { icon: "swap", title: "Hand off a task", description: "Move ownership to another agent.", onClick: () => {} }),
      h(X.ActionTile, { icon: "workflow", title: "Child agents in worktrees", description: "Each child gets its own worktree.", onClick: () => {} })),
  },
  "FilterChip": {
    style: {"display": "flex", "gap": "8px", "flexWrap": "wrap", "padding": "16px"},
    render: (X, h) => h(React.Fragment, null,
      h(X.FilterChip, { pressed: true, count: 4 }, "Working"),
      h(X.FilterChip, { pressed: false, count: 2 }, "Waiting"),
      h(X.FilterChip, { pressed: false, count: 9 }, "Done")),
  },
  "ListRow": {
    style: {"padding": "16px", "width": "340px"},
    render: (X, h) => h(React.Fragment, null,
      h(X.ListRow, { title: "login-retry", meta: "feat/login-retry · 2m", leading: h(X.StatusDot, { state: "working", label: "working" }), selected: true, onClick: function () {} }),
      h(X.ListRow, { title: "fix-ci-cache", meta: "fix/ci-cache · 9m", leading: h(X.StatusDot, { state: "waiting", label: "waiting" }), onClick: function () {} })),
  },
  "NavList": {
    style: {"padding": "16px", "width": "240px"},
    render: (X, h) => h(React.Fragment, null,
      h(X.NavList, { title: "Settings", value: "general", items: [{ id: "general", label: "General" }, { id: "agents", label: "Agents", count: 3 }, { id: "keys", label: "Keyboard" }] }),
      h(X.NavList, { title: "Content", collapsible: true, items: [{ id: "posts", label: "Posts", href: "#posts" }, { id: "pages", label: "Pages", href: "#pages" }] })),
  },
  "Popover": {
    style: {"padding": "16px", "height": "200px"},
    render: (X, h) => h(PopoverDemo, { X: X }),
  },
  "RadioGroup": {
    style: {"padding": "16px"},
    render: (X, h) => h(X.RadioGroup, { name: "shell", label: "Shell", defaultValue: "pwsh", options: [{ value: "pwsh", label: "PowerShell" }, { value: "bash", label: "Git Bash" }, { value: "cmd", label: "cmd" }] }),
  },
  "ColorField": {
    style: {"display": "flex", "flexDirection": "column", "gap": "12px", "padding": "16px", "width": "360px", "maxWidth": "100%"},
    render: (X, h) => h(React.Fragment, null,
      h(X.ColorField, { label: "Accent", value: "#2f62e6", overridden: true, onChange: function () {}, onReset: function () {}, labels: { reset: "Reset Accent", picker: "Pick Accent", invalid: "Use a colour like #2f62e6" } }),
      h(X.ColorField, { label: "Background", value: "#0a0f1e", overridden: false, onChange: function () {}, onReset: function () {}, labels: { reset: "Reset Background", picker: "Pick Background", invalid: "Use a colour like #0a0f1e" } })),
  },
  "ThemePreview": {
    style: {"display": "flex", "gap": "12px", "padding": "16px", "flexWrap": "wrap"},
    render: (X, h) => h(React.Fragment, null,
      h(X.ThemePreview, { mode: "dark", title: "Dark preview", sample: "Sample text", hint: "A hint line", button: "Button" }),
      h(X.ThemePreview, { mode: "light", title: "Light preview", sample: "Sample text", hint: "A hint line", button: "Button" })),
  },
  "ThemeEditor": {
    style: {"padding": "16px", "maxWidth": "720px"},
    render: (X, h) => h(X.ThemeEditor, {
      mode: "dark", onMode: function () {}, name: "Midnight", onName: function () {},
      groups: [
        { id: "surface", title: "Surfaces", keys: [{ key: "bg", label: "Background" }, { key: "panel", label: "Panel" }] },
        { id: "accent", title: "Accent", keys: [{ key: "accent", label: "Accent" }] },
      ],
      colors: { bg: "#0a0f1e", panel: "#0f1629", accent: "#2f62e6" },
      overridden: new Set(["accent"]),
      onColor: function () {}, onReset: function () {},
      issues: [{ key: "accent", message: "Contrast 2.9 against Panel; 4.5 needed" }],
      labels: { name: "Theme name", mode: "Mode", dark: "Dark", light: "Light", reset: "Reset {token}", picker: "Pick {token}", invalid: "Use a colour like #2f62e6",
        preview: { title: "Preview", sample: "Sample text", hint: "A hint line", button: "Button" }, issuesTitle: "Contrast", noIssues: "All pairs pass" },
    }),
  },
  "FontField": {
    style: {"padding": "16px", "width": "320px"},
    render: (X, h) => h(X.FontField, { value: "Inter", onChange: () => {}, "aria-label": "UI font" }),
  },
  "SearchInput": {
    style: {"padding": "16px", "width": "320px"},
    render: (X, h) => h(X.SearchInput, { placeholder: "Search sessions", shortcut: "Ctrl K", "aria-label": "Search sessions" }),
  },
  "SearchPicker": {
    style: {"padding": "16px", "width": "360px"},
    render: (X, h) => h(X.SearchPicker, { label: "Find an issue", placeholder: "Search issues", value: "da", onValueChange: () => {}, onPick: () => {}, items: [{ id: "15", title: "Add a dark theme", meta: "#15 · open" }, { id: "18", title: "Dark mode contrast", meta: "#18 · closed", disabled: true }] }),
  },
  "Combobox": {
    style: {"padding": "16px", "width": "360px", "minHeight": "220px"},
    render: (X, h) => h(X.Combobox, { label: "Cities", multiple: true, defaultOpen: true, placeholder: "Add cities", value: ["hn"], onChange: () => {}, options: [{ value: "hn", label: "Hà Nội", meta: "Capital" }, { value: "dn", label: "Đà Nẵng" }, { value: "hp", label: "Hải Phòng", disabled: true }, { value: "ct", label: "Cần Thơ" }] }),
  },
  "DatePicker": {
    style: {"padding": "16px", "width": "280px", "minHeight": "400px"},
    render: (X, h) => h(X.DatePicker, { label: "Due date", value: "2026-11-12", onChange: () => {}, today: "2026-11-06", min: "2026-11-03", defaultOpen: true }),
  },
  "DateRangePicker": {
    style: {"padding": "16px", "width": "420px", "minHeight": "420px", "display": "flex", "justifyContent": "flex-end"},
    render: (X, h) => h(X.DateRangePicker, { label: "Period", value: { start: "2026-11-02", end: "2026-11-12" }, onChange: () => {}, today: "2026-11-06", defaultOpen: true, presets: [{ label: "Last 7 days", range: { start: "2026-10-31", end: "2026-11-06" } }, { label: "This month", range: { start: "2026-11-01", end: "2026-11-30" } }] }),
  },
  "SettingRow": {
    style: {"padding": "16px", "width": "420px"},
    render: (X, h) => h(X.SettingRow, { label: "Restore sessions on launch", description: "Reopen the tabs that were open when xDev closed.", control: h(X.Switch, { label: "Restore sessions", defaultChecked: true }) }),
  },
  "Spinner": {
    style: {"display": "flex", "gap": "16px", "alignItems": "center", "padding": "16px"},
    render: (X, h) => h(React.Fragment, null, h(X.Spinner, { size: "sm", label: "Loading usage" }), h(X.Spinner, { size: "md", label: "Loading sessions" })),
  },
  "StepDots": {
    style: {"padding": "16px"},
    render: (X, h) => h(X.StepDots, { total: 3, current: 2 }),
  },
  "SplitHandle": {
    style: {"padding": "16px", "height": "160px"},
    render: (X, h) => h(SplitDemo, { X: X }),
  },
  "Tabs": {
    style: {"display": "flex", "flexDirection": "column", "gap": "16px", "padding": "16px"},
    render: (X, h) => h(React.Fragment, null,
      h(X.Tabs, { label: "Panel", items: [{ id: "changes", label: "Changes", badge: 3 }, { id: "files", label: "Files" }, { id: "log", label: "Log" }] }),
      h(X.Tabs, { label: "View", variant: "pill", items: [{ id: "split", label: "Split" }, { id: "unified", label: "Unified" }] })),
  },
  "Textarea": {
    style: {"padding": "16px", "width": "340px"},
    render: (X, h) => h(X.Textarea, { label: "Prompt", mono: true, rows: 3, defaultValue: "Add retry with backoff to the login call." }),
  },
  "Toolbar": {
    style: {"display": "flex", "flexDirection": "column", "gap": "12px", "padding": "16px", "width": "340px"},
    render: (X, h) => h(React.Fragment, null,
      h(X.Toolbar, { title: "Changes", count: 4, actions: h(React.Fragment, null, h(X.IconButton, { icon: "plus", label: "Stage all" }), h(X.IconButton, { icon: "more", label: "More" })) }),
      h(X.Toolbar, { variant: "bulk", title: "3 selected", actions: h(X.Button, { variant: "secondary" }, "Discard") })),
  },
  "Coachmark": {
    style: {"position": "relative", "height": "240px", "transform": "translateZ(0)"},
    render: (X, h) => h(X.Coachmark, { anchor: { top: 16, left: 16, width: 120, height: 28 }, placement: "bottom", title: "Start an agent", step: 2, total: 3, onBack() {}, onNext() {}, onSkip() {} }, "Each agent works in its own worktree, so tasks never collide."),
  },
  "Tooltip": {
    style: {"padding": "48px 16px 16px"},
    render: (X, h) => h(X.Tooltip, { content: "Copy branch name" }, h(X.IconButton, { icon: "copy", label: "Copy" })),
  },
  "TreeView": {
    style: {"padding": "16px", "width": "280px"},
    render: (X, h) => h(X.TreeView, { selected: "r", rows: [
      { id: "s", depth: 0, name: "src", kind: "dir", open: true },
      { id: "a", depth: 1, name: "auth", kind: "dir", open: true, changed: true },
      { id: "r", depth: 2, name: "retry.ts", kind: "file", mark: "modified" },
      { id: "t", depth: 2, name: "retry.test.ts", kind: "file", mark: "added" },
      { id: "p", depth: 0, name: "package.json", kind: "file" },
    ] }),
  },
  "AppShell": {
    style: {"height": "320px", "width": "640px", "maxWidth": "100%", "transform": "translateZ(0)", "overflow": "hidden"},
    render: (X, h) => h(X.AppShell, { brand: h(X.BrandMark, { size: 20 }), nav: h(X.NavList, { items: [{ id: "home", label: "Overview", icon: "home" }, { id: "users", label: "Users", icon: "accounts" }], value: "home" }), crumbs: h(X.Breadcrumb, { items: [{ label: "Overview" }] }) }, h("p", null, "Page content")),
  },
  "PageHeader": {
    style: {"padding": "16px", "width": "480px", "maxWidth": "100%"},
    render: (X, h) => h(X.PageHeader, { title: "Users", description: "People who can sign in to this workspace.", meta: h(X.StatusDot, { tone: "ok", label: "Active" }), actions: h(X.Button, null, "Create user") }),
  },
  "FormSection": {
    style: {"padding": "16px", "width": "520px", "maxWidth": "100%"},
    render: (X, h) => h(X.FormSection, { title: "Profile", description: "Shown to teammates.", columns: 2, actions: h(React.Fragment, null, h(X.Button, { variant: "secondary" }, "Cancel"), h(X.Button, null, "Save changes")) },
      h(X.Field, { label: "Full name", defaultValue: "Ada Lovelace" }),
      h(X.Field, { label: "Email", type: "email", defaultValue: "ada@example.com" })),
  },
  "Board": {
    style: {"padding": "16px", "width": "720px", "maxWidth": "100%", "height": "260px"},
    render: (X, h) => h(X.Board, { "aria-label": "Tasks" },
      ["Backlog", "To do", "In progress", "In review", "Done"].map(function (name, i) {
        return h(X.BoardColumn, { key: name, title: name, onAdd: i === 0 ? function () {} : undefined, count: i === 2 ? 2 : 1, dropTarget: i === 3 },
          h(X.BoardCard, { title: "Login retry", meta: "Claude", status: i === 2 ? "running" : undefined, selected: i === 1 }),
          i === 2 ? h(X.BoardCard, { title: "Fix CI cache", meta: "Codex", status: "waiting", tone: "need", dragging: true }) : null);
      })),
  },
  "DescriptionList": {
    style: {"padding": "16px", "width": "420px", "maxWidth": "100%"},
    render: (X, h) => h(X.DescriptionList, { items: [{ term: "Email", value: "ada@example.com", mono: true }, { term: "Role", value: "Owner" }, { term: "Created", value: "4 Nov 2026" }] }),
  },
  "StatTile": {
    style: {"display": "flex", "gap": "12px", "flexWrap": "wrap", "padding": "16px"},
    render: (X, h) => h(React.Fragment, null,
      h(X.StatTile, { label: "Active users", value: "1,284", delta: "+12%", deltaTrend: "up", deltaTone: "good", hint: "vs last 7 days" }),
      h(X.StatTile, { label: "Storage", value: "82 GB" }, h(X.Meter, { value: 82, warnAt: 80, label: "Used" })),
      h(X.StatTile, { label: "Sign-ins", value: "0", loading: true })),
  },
  "DataTable": {
    style: {"padding": "16px", "width": "520px", "maxWidth": "100%"},
    render: (X, h) => h(X.DataTable, { caption: "Users", rowKey: (r) => r.id, rowLabel: (r) => r.name, sort: { key: "name", dir: "asc" }, selected: new Set(["2"]), onSelectedChange() {},
      rows: [{ id: "1", name: "Ada Lovelace", email: "ada@example.com" }, { id: "2", name: "Grace Hopper", email: "grace@example.com" }],
      columns: [{ key: "name", header: "Name", sortable: true, cell: (r) => r.name }, { key: "email", header: "Email", mono: true, hideNarrow: true, cell: (r) => r.email }] }),
  },
  "FacetFilter": {
    style: {"padding": "16px", "minHeight": "300px", "width": "420px", "maxWidth": "100%"},
    render: (X, h) => h("div", { style: { display: "flex", gap: "8px" } },
      h(X.FacetFilter, { label: "Status", defaultOpen: true, searchable: true, selected: ["invited"], onChange() {},
        options: [{ value: "active", label: "Active", count: 40 }, { value: "invited", label: "Invited", count: 9 }, { value: "suspended", label: "Suspended", count: 8 }] }),
      h(X.FacetFilter, { label: "Role", selected: [], onChange() {}, options: [{ value: "admin", label: "Admin" }, { value: "viewer", label: "Viewer" }] })),
  },
  "BulkBar": {
    style: {"padding": "16px", "width": "520px", "maxWidth": "100%"},
    render: (X, h) => h(X.BulkBar, { count: 3, onClear() {} },
      h(X.Button, { variant: "secondary" }, "Suspend"),
      h(X.Button, { variant: "secondary", icon: "trash" }, "Delete")),
  },
  "SortableList": {
    style: {"padding": "16px", "width": "360px", "maxWidth": "100%"},
    render: (X, h) => h(SortableListDemo, { X: X }),
  },
  "Pagination": {
    style: {"padding": "16px", "width": "420px", "maxWidth": "100%"},
    render: (X, h) => h(X.Pagination, { page: 2, pageSize: 20, total: 57, onPageChange() {}, pageSizeOptions: [10, 20, 50], onPageSizeChange() {} }),
  },
};

function SortableListDemo({ X }) {
  const [items, setItems] = React.useState(["Install the app", "Create an account", "Pick a plan", "Invite the team"]);
  return React.createElement(X.SortableList, {
    items: items, label: "Onboarding steps", getKey: function (s) { return s; },
    onReorder: function (from, to) { setItems(X.moveItem(items, from, to)); },
    renderItem: function (s, i, handle) { return React.createElement(React.Fragment, null, handle, React.createElement("span", null, (i + 1) + ". " + s)); },
  });
}

function PopoverDemo({ X }) {
  const [open, setOpen] = React.useState(true);
  return React.createElement(X.Popover, {
    open: open, onClose: function () { setOpen(false); }, label: "Notifications",
    trigger: function (p) { return React.createElement(X.Button, Object.assign({ variant: "secondary", onClick: function () { setOpen(!open); } }, p), "Notifications"); },
  }, React.createElement("p", { style: { margin: 0, padding: 12 } }, "fix-ci-cache is waiting for review."));
}

function SplitDemo({ X }) {
  const [w, setW] = React.useState(140);
  const pane = { background: "var(--bg-2)", borderRadius: 6 };
  return React.createElement("div", { style: { display: "flex", height: "100%", width: 360 } },
    React.createElement("div", { style: Object.assign({ width: w }, pane) }),
    React.createElement(X.SplitHandle, { direction: "horizontal", value: w, min: 80, max: 260, onResize: setW, label: "Resize file tree" }),
    React.createElement("div", { style: Object.assign({ flex: 1 }, pane) }));
}
