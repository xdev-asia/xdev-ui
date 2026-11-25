import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Session } from "../auth/session";
import { seedRoles } from "../data/seed";
import { I18nProvider, translate, type Locale } from "../i18n";
import { navFor } from "../shell/nav";
import { DEVICES, DevicesPage, fitScale, frameSrc, pageGroups, previewable, screenOf, type DevicesPageProps } from "./Devices";

const roles = seedRoles();
const owner: Session = { name: "Ada Lovelace", email: "admin@example.com", role: "owner" };
const viewer: Session = { name: "Grace Hopper", email: "viewer@example.com", role: "viewer" };
const render = (props: Partial<DevicesPageProps> = {}, locale: Locale = "en") =>
  renderToStaticMarkup(
    <I18nProvider locale={locale}>
      <DevicesPage session={owner} roles={roles} theme="system" {...props} />
    </I18nProvider>,
  );
const count = (html: string, re: RegExp) => html.match(re)?.length ?? 0;

describe("Device preview", () => {
  it("shows the page in three titled frames at their true CSS sizes", () => {
    const html = render({ initialPage: "#/users" });
    expect(count(html, /<iframe/g)).toBe(3);
    expect(count(html, /<h1/g)).toBe(1);
    for (const [w, h] of [[390, 844], [768, 1024], [1440, 900]]) {
      expect(html).toContain(`${w} × ${h}`);
      expect(html).toContain(`width:${w}px;height:${h}px`);
    }
    expect(html).toContain('title="Users on a phone screen"');
    expect(html).toContain('title="Users on a desktop screen"');
    expect(html).toContain('src="?theme=system#/users"');
  });
  it("shows a loading state and a new-tab link per frame", () => {
    const html = render();
    expect(count(html, /role="status"/g)).toBe(3);
    expect(html).toContain("Loading the tablet preview…");
    expect(count(html, /target="_blank"/g)).toBe(3);
    expect(html).toContain('aria-label="Open Dashboard in a new tab"');
  });
  it("shows one frame and a device switch on a phone, in Vietnamese", () => {
    const html = render({ initialNarrow: true }, "vi");
    expect(count(html, /<iframe/g)).toBe(1);
    expect(html).toContain('aria-label="Thiết bị"');
    expect(html).toContain("Điện thoại");
    expect(html).toContain("Xem trên thiết bị");
  });
  it("on a phone, the desktop alone shows its landscape shape in the disabled orientation switch", () => {
    const orientation = (html: string) => html.slice(html.indexOf('aria-label="Orientation"')).split("</div>")[0] ?? "";
    const desk = orientation(render({ initialNarrow: true, initialDevice: "desktop", initialOrientation: "portrait" }));
    expect(desk).toMatch(/aria-pressed="true"[^>]*>Landscape</);
    expect(count(desk, /disabled=""/g)).toBe(2);
    const phone = orientation(render({ initialNarrow: true, initialDevice: "phone", initialOrientation: "portrait" }));
    expect(phone).toMatch(/aria-pressed="true"[^>]*>Portrait</);
    expect(count(phone, /disabled=""/g)).toBe(0);
  });
  it("never offers itself, links out or pages the role cannot see", () => {
    const html = render();
    expect(html).not.toContain('value="#/devices"');
    expect(html).not.toContain("react.dev");
    expect(html).toContain('<optgroup label="System">');
    expect(html).toContain('value="#/roles"');
    expect(render({ session: viewer })).not.toContain('value="#/roles"');
  });
  it("falls back to the first page for one it cannot show", () => {
    expect(render({ initialPage: "#/devices" })).toContain('src="?theme=system#/"');
    expect(render({ initialPage: "#/roles", session: viewer })).not.toContain("#/roles");
  });
});

describe("device preview helpers", () => {
  it("turns phones and tablets, not desktops", () => {
    expect(screenOf(DEVICES[0], "landscape")).toEqual({ width: 844, height: 390 });
    expect(screenOf(DEVICES[2], "landscape")).toEqual({ width: 1440, height: 900 });
  });
  it("scales down to the column, never up", () => {
    expect(fitScale(720, 1440)).toBe(0.5);
    expect(fitScale(2000, 1440)).toBe(1);
    expect(fitScale(0, 1440)).toBe(0);
  });
  it("keeps the store options in the frame address and sets the theme", () => {
    expect(frameSrc("/admin/", "?latency=0&theme=dark", "#/roles", "light")).toBe("/admin/?latency=0&theme=light#/roles");
  });
  it("groups pages under their top section, nested names joined", () => {
    const t = (k: string) => translate("en", k);
    const groups = pageGroups(previewable(navFor(roles, "owner")), t);
    expect(groups[0]).toEqual({ id: "dashboard", label: null, pages: [{ value: "#/", label: "Dashboard" }] });
    expect(groups.find((g) => g.id === "nested")?.pages.map((p) => p.label)).toEqual(["Menu 1 / Menu 1-1", "Menu 1 / Menu 1-2", "Menu 2"]);
    expect(groups.at(-1)?.id).toBe("about");
  });
});
