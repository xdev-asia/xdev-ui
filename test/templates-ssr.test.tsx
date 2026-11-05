import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tpl = (kind: string, p: string): string => join(root, "skills", `xdev-ui-${kind === "app" ? "build-app" : "admin"}`, "templates", kind, p);
const load = <T,>(kind: string, p: string): Promise<T> => import(/* @vite-ignore */ tpl(kind, p)) as Promise<T>;

type Provider = (p: { locale: "en" | "vi"; children: React.ReactNode }) => React.JSX.Element;

describe("app template", () => {
  it("renders the whole App to static markup with one h1, a skip link and a nav", async () => {
    const { App } = await load<{ App: () => React.JSX.Element }>("app", "src/App.tsx");
    const html = renderToStaticMarkup(<App />);
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("Skip to content");
    expect(html).toContain("<nav");
  });
  for (const locale of ["en", "vi"] as const) {
    for (const page of ["Home", "Settings", "NotFound"]) {
      it(`${page} renders in ${locale}`, async () => {
        const { I18nProvider } = await load<{ I18nProvider: Provider }>("app", "src/i18n/index.tsx");
        const mod = await load<Record<string, () => React.JSX.Element>>("app", `src/pages/${page}.tsx`);
        const Page = mod[`${page}Page`];
        const html = renderToStaticMarkup(<I18nProvider locale={locale}><Page /></I18nProvider>);
        expect(html.length).toBeGreaterThan(50);
        expect(html).not.toMatch(/\b(undefined|\[object Object\])\b/);
      });
    }
  }
  it("en and vi have the same keys and no empty value", async () => {
    const { en } = await load<{ en: object }>("app", "src/i18n/en.ts");
    const { vi } = await load<{ vi: object }>("app", "src/i18n/vi.ts");
    const keys = (o: object, p = ""): string[] => Object.entries(o).flatMap(([k, v]) => (typeof v === "string" ? (v ? [p + k] : [`${p}${k} (empty)`]) : keys(v as object, `${p}${k}.`)));
    expect(keys(vi)).toEqual(keys(en));
  });
  it("ships its dotfiles under underscore names", () => {
    for (const f of ["_npmrc", "_gitignore", "_mcp.json", "package.json", "index.html", "vite.config.ts", "tsconfig.json"]) expect(readFileSync(tpl("app", f), "utf8").length).toBeGreaterThan(0);
    expect(readFileSync(tpl("app", "_npmrc"), "utf8")).not.toMatch(/authToken/i);
  });
});

type P = Record<string, unknown>;
const noop = () => {};

describe("admin template", () => {
  const html = async (locale: "en" | "vi", page: string, exportName: string, props: P): Promise<string> => {
    const { I18nProvider } = await load<{ I18nProvider: Provider }>("admin", "src/i18n/index.tsx");
    const mod = await load<Record<string, (p: P) => React.JSX.Element>>("admin", `src/pages/${page}.tsx`);
    const View = mod[exportName];
    return renderToStaticMarkup(<I18nProvider locale={locale}><View {...props} /></I18nProvider>);
  };
  const store = async () => {
    const { createStore } = await load<{ createStore: () => { listItems(): Promise<unknown[]> } }>("admin", "src/data/store.ts");
    return createStore().listItems();
  };

  it("renders the whole App signed out: the sign-in page with one h1", async () => {
    const { App } = await load<{ App: () => React.JSX.Element }>("admin", "src/App.tsx");
    const out = renderToStaticMarkup(<App />);
    expect(out.match(/<h1/g)).toHaveLength(1);
    expect(out).toContain('type="password"');
  });
  for (const locale of ["en", "vi"] as const) {
    it(`Dashboard: ready, loading and error (${locale})`, async () => {
      const data = { total: 25, active: 12, archived: 4, recent: [] };
      const ready = await html(locale, "Dashboard", "DashboardView", { state: { status: "ready", data }, onRetry: noop });
      expect(ready.match(/class="x-stat"/g)).toHaveLength(3);
      expect(ready.match(/<h1/g)).toHaveLength(1);
      expect(await html(locale, "Dashboard", "DashboardView", { state: { status: "loading" }, onRetry: noop })).toContain('aria-busy="true"');
      expect(await html(locale, "Dashboard", "DashboardView", { state: { status: "error" }, onRetry: noop })).toContain(locale === "en" ? "Try again" : "Thử lại");
    });
    it(`ItemsList: table, search, filters and pagination (${locale})`, async () => {
      const out = await html(locale, "ItemsList", "ItemsView", { state: { status: "ready", data: await store() }, canCreate: true, query: "", onQueryChange: noop, statuses: new Set(), onStatusesChange: noop, page: 1, pageSize: 10, onPageChange: noop, onCreate: noop, onRetry: noop });
      expect(out).toContain("<table");
      expect(out).toContain('role="search"');
      expect(out.match(/aria-pressed/g)).toHaveLength(3);
      expect(out).toContain("x-pagination");
      expect(out.match(/class="btn"/g)).toHaveLength(1);
    });
  }
  it("ItemsList: a viewer sees no create button and an empty search names the query", async () => {
    const base = { state: { status: "ready", data: await store() }, canCreate: false, query: "", onQueryChange: noop, statuses: new Set(), onStatusesChange: noop, page: 1, pageSize: 10, onPageChange: noop, onCreate: noop, onRetry: noop };
    expect(await html("en", "ItemsList", "ItemsView", base)).not.toContain("Create item");
    expect(await html("en", "ItemsList", "ItemsView", { ...base, query: "zzzz" })).toContain("zzzz");
  });
  for (const locale of ["en", "vi"] as const) {
    it(`ItemDetail: description list and edit form (${locale})`, async () => {
      const [item] = await store();
      const out = await html(locale, "ItemDetail", "ItemDetailView", { state: { status: "ready", data: item }, canEdit: true, name: "Alpha", nameError: false, onNameChange: noop, onSave: noop, onRetry: noop });
      expect(out).toContain("<dl");
      expect(out.match(/<h1/g)).toHaveLength(1);
      expect(out.match(/class="btn"/g)).toHaveLength(1);
    });
    it(`Settings and NotFound (${locale})`, async () => {
      expect(await html(locale, "Settings", "SettingsPage", {})).toContain('role="switch"');
      expect(await html(locale, "NotFound", "NotFoundPage", {})).toContain("btn");
    });
  }
  it("permissions: admins write, viewers read", async () => {
    const { can } = await load<{ can: (role: string, cap: string) => boolean }>("admin", "src/auth/permissions.ts");
    expect(can("admin", "items.create")).toBe(true);
    expect(can("viewer", "items.create")).toBe(false);
    expect(can("viewer", "items.update")).toBe(false);
  });
  it("en and vi have the same keys", async () => {
    const { en } = await load<{ en: object }>("admin", "src/i18n/en.ts");
    const { vi } = await load<{ vi: object }>("admin", "src/i18n/vi.ts");
    const keys = (o: object, p = ""): string[] => Object.entries(o).flatMap(([k, v]) => (typeof v === "string" ? (v ? [p + k] : [`${p}${k} (empty)`]) : keys(v as object, `${p}${k}.`)));
    expect(keys(vi)).toEqual(keys(en));
  });
});
