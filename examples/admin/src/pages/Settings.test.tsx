import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { I18nProvider, type Locale } from "../i18n";
import { SettingsView, SECTIONS, sectionOf, type SettingsViewProps } from "./Settings";

const noop = () => {};
function props(over: Partial<SettingsViewProps> = {}): SettingsViewProps {
  return {
    section: "general",
    canEdit: true,
    orgName: "Acme",
    orgError: false,
    onOrgName: noop,
    onSaveOrg: noop,
    theme: "dark",
    onTheme: noop,
    locale: "en",
    onLocale: noop,
    flags: { twoFactor: false, emailDigest: true, securityAlerts: true },
    onFlag: noop,
    sessionLength: "1d",
    onSessionLength: noop,
    ...over,
  };
}
const render = (locale: Locale, p: SettingsViewProps) =>
  renderToStaticMarkup(
    <I18nProvider locale={locale}>
      <SettingsView {...p} />
    </I18nProvider>,
  );

describe("sectionOf", () => {
  it("falls back to general for an unknown section", () => {
    expect(sectionOf("security")).toBe("security");
    expect(sectionOf("nope")).toBe("general");
    expect(sectionOf(undefined)).toBe("general");
  });
});

describe("Settings", () => {
  for (const locale of ["en", "vi"] as const) {
    it(`lists four sections and marks the current one (${locale})`, () => {
      const html = render(locale, props({ section: "appearance" }));
      expect(html.match(/<h1/g)).toHaveLength(1);
      expect(html.match(/aria-current="page"/g)).toHaveLength(1);
      for (const s of SECTIONS) expect(html).toContain(`#/settings/${s}`);
      expect(html).toContain(locale === "en" ? "Language" : "Ngôn ngữ");
    });
  }
  it("general: name field, one primary save", () => {
    const html = render("en", props());
    expect(html).toContain("Workspace name");
    expect(html.match(/class="btn"/g)).toHaveLength(1);
  });
  it("general: an empty name shows the error", () => {
    expect(render("en", props({ orgName: "", orgError: true }))).toContain("Enter a workspace name.");
  });
  it("appearance: theme switch with three segments, language select", () => {
    const html = render("en", props({ section: "appearance" }));
    expect(html.match(/aria-pressed/g)).toHaveLength(3);
    expect(html).toContain("<select");
  });
  it("security and notifications use switches", () => {
    expect(render("en", props({ section: "security" })).match(/role="switch"/g)).toHaveLength(1);
    expect(render("en", props({ section: "notifications" })).match(/role="switch"/g)).toHaveLength(2);
  });
  it("a role that cannot edit gets disabled controls and no save", () => {
    const html = render("en", props({ canEdit: false }));
    expect(html).not.toContain("Save changes");
    expect(render("en", props({ canEdit: false, section: "security" }))).toMatch(/role="switch"[^>]*disabled|disabled=""[^>]*role="switch"/);
  });
});
