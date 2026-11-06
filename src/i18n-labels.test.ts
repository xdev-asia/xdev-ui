import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ActivityBar,
  AppShell,
  BulkBar,
  Breadcrumb,
  CodeBlock,
  Combobox,
  CommandPalette,
  DataTable,
  DatePicker,
  DateRangePicker,
  DiffStat,
  FacetFilter,
  Dialog,
  NavList,
  Pagination,
  SearchInput,
  SearchPicker,
  Spinner,
  SplitHandle,
  StatTile,
  TabStrip,
  ThemeSwitch,
  Toast,
  Toaster,
  Toolbar,
  TreeView,
  FontField,
  Drawer,
  FileDrop,
  FormDialog,
  SaveBar,
  Skeleton,
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

  it("Toaster", () => {
    const html = renderToStaticMarkup(h(Toaster, { labels: { region: S("r"), dismiss: S("d") } }));
    expect(html).toContain(S("r"));
    expectNoEnglish(html, ["Notifications"]);
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

  it("FontField", () => {
    const html = renderToStaticMarkup(h(FontField, { value: "Inter", onChange: () => {}, labels: { reset: S("r") } }));
    expect(html).toContain(S("r"));
    expectNoEnglish(html, ["Use the default font"]);
  });

  it("SearchPicker", () => {
    const html = renderToStaticMarkup(h(SearchPicker, { label: S("l"), value: "a", onValueChange: () => {}, items: [], onPick: () => {}, labels: { clear: S("c") } }));
    expect(html).toContain(S("c"));
    expectNoEnglish(html, ["Clear search"]);
  });

  it("Combobox", () => {
    const labels = { noResults: S("n"), create: (t: string) => S(`c${t}`), remove: (t: string) => S(`r${t}`), clear: S("x") };
    const chips = renderToStaticMarkup(h(Combobox, { label: S("l"), multiple: true, options: [{ value: "a", label: "A" }], value: ["a"], onChange() {}, onCreate() {}, labels }));
    expect(chips).toContain(S("rA"));
    expect(chips).toContain(S("x"));
    expectNoEnglish(chips, ["Remove", "Clear", "Create", "No results"]);
    const empty = renderToStaticMarkup(h(Combobox, { label: S("l"), options: [], value: null, onChange() {}, defaultOpen: true, labels }));
    expect(empty).toContain(S("n"));
    expectNoEnglish(empty, ["No results"]);
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

  it("AppShell", () => {
    const labels = { openNav: S("on"), closeNav: S("cn"), skipToContent: S("sk"), nav: S("nv") };
    const html = renderToStaticMarkup(h(AppShell, { nav: "n", labels, children: "c" }));
    for (const v of [S("on"), S("sk"), S("nv")]) expect(html).toContain(v);
    expectNoEnglish(html, ["Open navigation", "Skip to content", "Navigation"]);
    expect(renderToStaticMarkup(h(AppShell, { nav: "n", navOpen: true, labels, children: "c" }))).toContain(S("cn"));
  });

  it("StatTile", () => {
    const html = renderToStaticMarkup(h(StatTile, { label: "L", value: "1", loading: true, labels: { loading: S("l") } }));
    expect(html).toContain(S("l"));
    expectNoEnglish(html, ["Loading"]);
  });

  it("DataTable", () => {
    const DT = DataTable as unknown as (p: Record<string, unknown>) => ReturnType<typeof DataTable>;
    const labels = { selectAll: S("sa"), selectRow: (n: string) => `${S("sr")}${n}`, sortedAsc: S("as"), sortedDesc: S("ds"), loading: S("ld") };
    const props = { caption: "c", rowKey: (r: { id: string }) => r.id, rowLabel: (r: { id: string }) => r.id, columns: [{ key: "a", header: "A", sortable: true, cell: (r: { id: string }) => r.id }], labels };
    const html = renderToStaticMarkup(h(DT, { ...props, rows: [{ id: "x" }], selected: new Set<string>(), sort: { key: "a", dir: "asc" } }));
    for (const v of [S("sa"), `${S("sr")}x`, S("as")]) expect(html).toContain(v);
    expectNoEnglish(html, ["Select all rows", "Select", "sorted ascending"]);
    const desc = renderToStaticMarkup(h(DT, { ...props, rows: [{ id: "x" }], sort: { key: "a", dir: "desc" } }));
    expect(desc).toContain(S("ds"));
    expect(renderToStaticMarkup(h(DT, { ...props, rows: [], loading: true }))).toContain(S("ld"));
  });

  it("Pagination", () => {
    const labels = { nav: S("nv"), previous: S("pv"), next: S("nx"), range: (a: number, b: number, t: number) => `${S("r")}${a}-${b}-${t}`, pageSize: S("ps") };
    const html = renderToStaticMarkup(h(Pagination, { page: 1, pageSize: 10, total: 25, onPageChange() {}, pageSizeOptions: [10], labels }));
    for (const v of [S("nv"), S("pv"), S("nx"), `${S("r")}1-10-25`, S("ps")]) expect(html).toContain(v);
    expectNoEnglish(html, ["Pagination", "Previous page", "Next page", "of", "Rows per page"]);
  });

  it("Skeleton", () => {
    const html = renderToStaticMarkup(h(Skeleton, { announce: true, labels: { loading: S("l") } }));
    expect(html).toContain(S("l"));
    expectNoEnglish(html, ["Loading"]);
  });

  it("Drawer", () => {
    const html = renderToStaticMarkup(h(Drawer, { title: "T", modal: false, onClose() {}, labels: { close: S("c") } }));
    expect(html).toContain(S("c"));
    expectNoEnglish(html, ["Close"]);
  });

  it("FormDialog", () => {
    const labels = { submit: S("s"), cancel: S("c"), saving: S("v") };
    const html = renderToStaticMarkup(h(FormDialog, { title: "T", modal: false, onSubmit() {}, onCancel() {}, labels }));
    for (const v of [S("s"), S("c")]) expect(html).toContain(v);
    expectNoEnglish(html, ["Save", "Cancel"]);
    expect(renderToStaticMarkup(h(FormDialog, { title: "T", modal: false, busy: true, onSubmit() {}, onCancel() {}, labels }))).toContain(S("v"));
  });

  it("SaveBar", () => {
    const labels = { unsaved: S("u"), save: S("s"), discard: S("d"), saving: S("v") };
    const html = renderToStaticMarkup(h(SaveBar, { dirty: true, onSave() {}, onDiscard() {}, labels }));
    for (const v of [S("u"), S("s"), S("d")]) expect(html).toContain(v);
    expectNoEnglish(html, ["unsaved", "Save", "Discard"]);
  });

  it("FileDrop", () => {
    const labels = { drop: S("d"), browse: S("b"), limits: () => S("l"), rejected: () => S("r"), remove: (n: string) => `${S("x")}${n}`, uploading: () => S("u") };
    const html = renderToStaticMarkup(h(FileDrop, { label: "F", maxSize: 10, onFiles() {}, onRemove() {}, items: [{ id: "1", name: "a", progress: 5 }], labels }));
    for (const v of [S("d"), S("b"), S("l"), `${S("x")}a`, S("u")]) expect(html).toContain(v);
    expectNoEnglish(html, ["Drop", "browse", "Remove", "Uploading", "Accepted"]);
  });

  it("DataTable reorder", () => {
    const DT = DataTable as unknown as (p: Record<string, unknown>) => ReturnType<typeof DataTable>;
    const labels = { reorderColumn: S("oc"), reorderHandle: (n: string) => `${S("rh")}${n}`, lifted: (n: string) => S(`lf${n}`), moved: (a: number, b: number) => S(`mv${a}${b}`), dropped: (a: number, b: number) => S(`dr${a}${b}`), cancelled: S("cc") };
    const html = renderToStaticMarkup(h(DT, { caption: "c", rowKey: (r: { id: string }) => r.id, columns: [{ key: "a", header: "A", cell: (r: { id: string }) => r.id }], rows: [{ id: "x" }, { id: "y" }], reorderable: true, labels }));
    for (const v of [S("oc"), `${S("rh")}x`, `${S("rh")}y`]) expect(html).toContain(v);
    expectNoEnglish(html, ["Order", "Reorder"]);
  });

  it("FacetFilter", () => {
    const labels = { search: S("se"), clearSearch: S("cs"), clear: S("cl"), noResults: S("nr"), selected: (n: number) => `${S("sl")}${n}` };
    const options = [{ value: "a", label: "A" }];
    const html = renderToStaticMarkup(h(FacetFilter, { label: "L", options, selected: ["a"], onChange() {}, searchable: true, defaultOpen: true, labels }));
    for (const v of [S("se"), S("cl"), `${S("sl")}1`]) expect(html).toContain(v);
    expectNoEnglish(html, ["Search options", "Clear", "selected"]);
    const none = renderToStaticMarkup(h(FacetFilter, { label: "L", options: [], selected: [], onChange() {}, searchable: true, defaultOpen: true, labels }));
    expect(none).toContain(S("nr"));
    expectNoEnglish(none, ["No options match"]);
  });

  it("BulkBar", () => {
    const labels = { region: S("rg"), selected: (n: number) => `${S("sl")}${n}`, clear: S("cl") };
    const html = renderToStaticMarkup(h(BulkBar, { count: 2, onClear() {}, labels }));
    for (const v of [S("rg"), `${S("sl")}2`, S("cl")]) expect(html).toContain(v);
    expectNoEnglish(html, ["Bulk actions", "selected", "Clear selection"]);
  });

  it("DatePicker", () => {
    const labels = { openCalendar: S("oc"), calendar: S("cal"), previousMonth: S("pm"), nextMonth: S("nm"), today: S("td"), clear: S("cl"), invalid: S("inv") };
    const html = renderToStaticMarkup(h(DatePicker, { label: "L", value: "2026-11-06", onChange() {}, today: "2026-11-06", defaultOpen: true, labels }));
    for (const k of ["oc", "cal", "pm", "nm", "td", "cl"]) expect(html).toContain(S(k));
    expectNoEnglish(html, ["Open calendar", "Choose date", "Previous month", "Next month", "Today", "Clear"]);
  });

  it("DateRangePicker", () => {
    const labels = { openCalendar: S("oc"), calendar: S("cal"), previousMonth: S("pm"), nextMonth: S("nm"), today: S("td"), clear: S("cl"), start: S("st"), end: S("en"), presets: S("pr"), invalid: S("inv") };
    const html = renderToStaticMarkup(
      h(DateRangePicker, { label: "L", value: { start: "2026-11-02", end: "2026-11-06" }, onChange() {}, today: "2026-11-06", defaultOpen: true, presets: [{ label: "P", range: { start: null, end: null } }], labels }),
    );
    for (const k of ["oc", "cal", "pm", "nm", "td", "cl", "st", "en", "pr"]) expect(html).toContain(S(k));
    expectNoEnglish(html, ["Open calendar", "Choose dates", "Previous month", "Next month", "Today", "Clear", "Start date", "End date", "Presets"]);
  });
});
