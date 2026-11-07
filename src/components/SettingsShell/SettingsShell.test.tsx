import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SettingsShell, filterSettingsGroups, matchesSetting, type SettingsShellGroup } from "./SettingsShell";

const groups: SettingsShellGroup[] = [
  { id: "g", label: "General", items: [{ id: "appearance", label: "Appearance", keywords: ["theme", "dark"] }, { id: "lang", label: "Ngôn ngữ" }] },
  { id: "t", label: "Terminal", items: [{ id: "font", label: "Font" }] },
];
const base = { groups, value: "appearance", onChange() {}, onQuery() {} };

describe("matchesSetting / filterSettingsGroups", () => {
  it("matches label and keywords, ignoring case and diacritics", () => {
    expect(matchesSetting(groups[0].items[0], "DARK")).toBe(true);
    expect(matchesSetting(groups[0].items[1], "ngon ngu")).toBe(true);
    expect(matchesSetting(groups[0].items[0], "font")).toBe(false);
    expect(matchesSetting(groups[0].items[0], "  ")).toBe(true);
  });
  it("drops items and then empty groups", () => {
    expect(filterSettingsGroups(groups, "font").map((g) => g.id)).toEqual(["t"]);
    expect(filterSettingsGroups(groups, "").length).toBe(2);
    expect(filterSettingsGroups(groups, "zzz")).toEqual([]);
  });
});

describe("SettingsShell", () => {
  it("renders a search, one nav per group, the content and the save slot", () => {
    const html = renderToStaticMarkup(
      <SettingsShell {...base} query="" saveBar={<div id="sb">bar</div>}>
        <p>rows</p>
      </SettingsShell>,
    );
    expect(html).toContain('type="search"');
    expect(html).toContain('aria-label="Search settings"');
    expect(html.match(/<nav /g)).toHaveLength(2);
    expect(html).toContain('aria-label="General"');
    expect(html).toContain("<p>rows</p>");
    expect(html).toContain('<div class="x-settings-shell-save"><div id="sb">bar</div></div>');
    expect(html).toMatch(/aria-current="page"[^>]*>(?:(?!<\/button>).)*Appearance/);
  });

  it("leaves the save slot empty without a saveBar", () => {
    expect(renderToStaticMarkup(<SettingsShell {...base} query="">x</SettingsShell>)).toContain('<div class="x-settings-shell-save"></div>');
  });

  it("filters the nav by query and announces the count", () => {
    const html = renderToStaticMarkup(
      <SettingsShell {...base} query="font">
        x
      </SettingsShell>,
    );
    expect(html.match(/<nav /g)).toHaveLength(1);
    expect(html).not.toContain("Appearance");
    expect(html).toContain("1 result");
    expect(html).toContain('aria-live="polite"');
  });

  it("hands the search state to a children function", () => {
    const html = renderToStaticMarkup(
      <SettingsShell {...base} query="dark">
        {(s) => (
          <>
            {s.visible("appearance") ? <i>A</i> : null}
            {s.visible("font") ? <i>F</i> : null}
            <b>{s.matches}</b>
          </>
        )}
      </SettingsShell>,
    );
    expect(html).toContain("<i>A</i>");
    expect(html).not.toContain("<i>F</i>");
    expect(html).toContain("<b>1</b>");
  });

  it("shows the empty text instead of the content when nothing matches", () => {
    const html = renderToStaticMarkup(
      <SettingsShell {...base} query="zzz">
        <p>rows</p>
      </SettingsShell>,
    );
    expect(html).toContain('No settings match &quot;zzz&quot;');
    expect(html).not.toContain("<p>rows</p>");
  });

  it("takes translated labels", () => {
    const html = renderToStaticMarkup(
      <SettingsShell {...base} query="zzz" labels={{ search: "Tìm cài đặt", empty: (q) => `Không có "${q}"`, count: (n) => `${n} kết quả` }}>
        x
      </SettingsShell>,
    );
    expect(html).toContain("Tìm cài đặt");
    expect(html).toContain("Không có &quot;zzz&quot;");
    expect(html).toContain("0 kết quả");
    expect(html).not.toMatch(/Search settings|No settings|results/);
  });
});
