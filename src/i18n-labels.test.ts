import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ActivityBar,
  Breadcrumb,
  CodeBlock,
  CommandPalette,
  DiffStat,
  Dialog,
  NavList,
  SearchInput,
  SearchPicker,
  Spinner,
  SplitHandle,
  TabStrip,
  ThemeSwitch,
  Toast,
  Toolbar,
  TreeView,
} from "./index";

const S = (k: string) => `§${k}§`;

/** Every English default the library ships; none may appear when labels override all of them. */
function expectNoEnglish(html: string, words: string[]) {
  const text = html.replace(/<[^>]*>/g, " ").concat(" ", [...html.matchAll(/(?:aria-label|title|placeholder)="([^"]*)"/g)].map((m) => m[1]).join(" "));
  for (const w of words) expect(text, `default "${w}" leaked`).not.toMatch(new RegExp(`\\b${w}\\b`, "i"));
}

describe("labels override every default English string", () => {
  it("Dialog", () => {
    const html = renderToStaticMarkup(h(Dialog, { title: "T", labels: { confirm: S("c"), cancel: S("x") } }));
    expect(html).toContain(S("c"));
    expect(html).toContain(S("x"));
    expectNoEnglish(html, ["OK", "Cancel"]);
  });

  it("Dialog: confirmLabel and cancelLabel props still win", () => {
    const html = renderToStaticMarkup(h(Dialog, { title: "T", confirmLabel: "Yes", cancelLabel: null, labels: { confirm: S("c"), cancel: S("x") } }));
    expect(html).toContain("Yes");
    expect(html).not.toContain(S("x"));
  });

  it("ThemeSwitch", () => {
    const labels = { group: S("g"), system: S("s"), dark: S("d"), light: S("l") };
    const html = renderToStaticMarkup(h(ThemeSwitch, { value: "dark", onChange() {}, labels }));
    for (const v of Object.values(labels)) expect(html).toContain(v);
    expectNoEnglish(html, ["Theme", "System", "Dark", "Light"]);
  });

  it("Toast", () => {
    const html = renderToStaticMarkup(h(Toast, { onDismiss() {}, labels: { dismiss: S("d") }, children: "msg" }));
    expect(html).toContain(S("d"));
    expectNoEnglish(html, ["Dismiss"]);
  });

  it("TabStrip", () => {
    const labels = { skipped: S("s"), unsaved: S("u"), newTab: S("n"), close: (n: string) => `${S("cls")}${n}` };
    const html = renderToStaticMarkup(
      h(TabStrip, {
        tabs: [
          { id: "a", name: "alpha", skipped: true },
          { id: "b", name: "beta", dirty: true },
        ],
        labels,
      }),
    );
    for (const v of [S("s"), S("u"), S("n"), `${S("cls")}alpha`]) expect(html).toContain(v);
    expectNoEnglish(html, ["skipped", "Unsaved", "New tab", "Close"]);
  });

  it("CommandPalette", () => {
    const labels = { dialog: S("dlg"), placeholder: S("ph"), search: S("se"), noMatches: S("nm"), move: S("mv"), open: S("op"), close: S("cl") };
    const html = renderToStaticMarkup(h(CommandPalette, { sections: [], labels }));
    for (const v of Object.values(labels)) expect(html).toContain(v);
    expectNoEnglish(html, ["Command palette", "Search", "No matches", "move", "open", "close", "commands"]);
  });

  it("ActivityBar", () => {
    const html = renderToStaticMarkup(
      h(ActivityBar, {
        changeCount: 3,
        labels: { nav: S("nav"), count: (b: string, n: number) => `${b}#${n}${S("cnt")}`, docs: "D", changes: "C", tasks: "T", squads: "S", agents: "A", kit: "K", accounts: "U", terminal: "M" },
      }),
    );
    expect(html).toContain(S("nav"));
    expect(html).toContain(`C#3${S("cnt")}`);
    expectNoEnglish(html, ["Apps", "Changes", "Docs", "Tasks", "Squads", "Agents", "Kit", "Accounts", "Terminal"]);
  });

  it("DiffStat", () => {
    const html = renderToStaticMarkup(h(DiffStat, { added: 2, removed: 5, labels: { diffStat: (a, r) => `${S("d")}${a}/${r}` } }));
    expect(html).toContain(`${S("d")}2/5`);
    expectNoEnglish(html, ["added", "removed"]);
  });

  it("SearchInput", () => {
    const html = renderToStaticMarkup(
      h(SearchInput, { value: "auth", onChange: () => {}, onClear: () => {}, count: 4, labels: { search: S("s"), clear: S("c"), count: (n: number) => `${S("n")}${n}` } }),
    );
    expect(html).toContain(S("s"));
    expect(html).toContain(S("c"));
    expect(html).toContain(`${S("n")}4`);
    expectNoEnglish(html, ["Search", "Clear search", "results?"]);
  });

  it("SearchPicker", () => {
    const html = renderToStaticMarkup(h(SearchPicker, { label: S("l"), value: "a", onValueChange: () => {}, items: [], onPick: () => {}, labels: { clear: S("c") } }));
    expect(html).toContain(S("c"));
    expectNoEnglish(html, ["Clear search"]);
  });

  it("Breadcrumb", () => {
    const html = renderToStaticMarkup(h(Breadcrumb, { items: [{ label: "xdev" }, { label: "main", mono: true }], labels: { breadcrumb: S("b") } }));
    expect(html).toContain(S("b"));
    expectNoEnglish(html, ["Breadcrumb"]);
  });

  it("TreeView", () => {
    const html = renderToStaticMarkup(
      h(TreeView, {
        rows: [
          { id: "src", depth: 0, name: "src", kind: "dir", open: true, changed: true },
          { id: "src/a.ts", depth: 1, name: "a.ts", kind: "file", mark: "added" },
          { id: "src/b.ts", depth: 1, name: "b.ts", kind: "file", mark: "modified" },
          { id: "src/c.ts", depth: 1, name: "c.ts", kind: "file", mark: "deleted" },
          { id: "src/d.ts", depth: 1, name: "d.ts", kind: "file", mark: "renamed" },
        ],
        labels: { tree: S("t"), changed: S("ch"), marks: { added: S("a"), modified: S("m"), deleted: S("d"), renamed: S("r") } },
      }),
    );
    for (const k of ["t", "ch", "a", "m", "d", "r"]) expect(html).toContain(S(k));
    expectNoEnglish(html, ["Files", "Changed", "Added", "Modified", "Deleted", "Renamed"]);
  });

  it("NavList", () => {
    const html = renderToStaticMarkup(h(NavList, { items: [{ id: "general", label: "G" }], value: "general", onSelect: () => {}, labels: { nav: S("nav") } }));
    expect(html).toContain(S("nav"));
    expectNoEnglish(html, ["Sections"]);
  });

  it("CodeBlock", () => {
    const html = renderToStaticMarkup(h(CodeBlock, { code: "pnpm test", labels: { copy: S("cp"), copied: S("cpd") } }));
    expect(html).toContain(S("cp"));
    expectNoEnglish(html, ["Copy", "Copied"]);
  });

  it("Spinner", () => {
    const html = renderToStaticMarkup(h(Spinner, { labels: { loading: S("l") } }));
    expect(html).toContain(S("l"));
    expectNoEnglish(html, ["Loading"]);
  });

  it("SplitHandle", () => {
    const html = renderToStaticMarkup(h(SplitHandle, { direction: "horizontal", value: 240, min: 160, max: 420, onResize: () => {}, labels: { resize: S("rs") } }));
    expect(html).toContain(S("rs"));
    expectNoEnglish(html, ["Resize panel"]);
  });

  it("Toolbar", () => {
    const html = renderToStaticMarkup(h(Toolbar, { title: h("b", null, "3"), actions: h("button", { type: "button" }, "x"), labels: { actions: S("ac") } }));
    expect(html).toContain(S("ac"));
    expectNoEnglish(html, ["Actions"]);
  });
});
