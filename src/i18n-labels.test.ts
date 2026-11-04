import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ActivityBar, CommandPalette, DiffStat, Dialog, TabStrip, Toast } from "./index";

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
});
