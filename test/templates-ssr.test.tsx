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
