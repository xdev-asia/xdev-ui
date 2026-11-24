import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { seedNotices } from "../data/catalog";
import { seedRoles } from "../data/seed";
import { I18nProvider } from "../i18n";
import { matchRoute } from "../router";
import { canOpen, currentOf, navFor } from "./nav";
import { Notifications } from "./Notifications";
import { PreferencesDrawer } from "./PreferencesDrawer";
import { closeTabs, DEFAULT_PREFS, readPrefs, readTabs, visitTab } from "./prefs";

const roles = seedRoles();

describe("nav", () => {
  it("drops entries and groups a role cannot read", () => {
    const viewer = navFor(roles, "viewer").flatMap((g) => g.items.map((e) => e.id));
    expect(viewer).toContain("users");
    expect(viewer).not.toContain("roles");
    expect(viewer).not.toContain("menus");
    expect(navFor(roles, "owner").flatMap((g) => g.items).length).toBeGreaterThan(viewer.length);
  });
  it("finds the current entry, including pages with params", () => {
    expect(currentOf(matchRoute("#/users/u3"))?.entry.id).toBe("users");
    expect(currentOf(matchRoute("#/exception/500"))?.entry.id).toBe("500");
    expect(currentOf(matchRoute("#/nested/menu2"))?.group.id).toBe("nested");
    expect(currentOf(matchRoute("#/nope"))).toBeNull();
  });
  it("blocks a link to a page the role cannot read", () => {
    expect(canOpen(matchRoute("#/roles"), roles, "viewer")).toBe(false);
    expect(canOpen(matchRoute("#/roles"), roles, "admin")).toBe(true);
    expect(canOpen(matchRoute("#/nope"), roles, "viewer")).toBe(true);
  });
});

describe("prefs and page tabs", () => {
  it("reads stored prefs one by one, with defaults for the rest", () => {
    expect(readPrefs(null)).toEqual(DEFAULT_PREFS);
    expect(readPrefs("not json")).toEqual(DEFAULT_PREFS);
    expect(readPrefs('{"tabs":false,"footer":"yes"}')).toEqual({ ...DEFAULT_PREFS, tabs: false });
  });
  it("keeps home first, adds a page once, refreshes its title and drops the oldest over the limit", () => {
    let tabs = visitTab([], { path: "/users", title: "Users" });
    tabs = visitTab(tabs, { path: "/", title: "Dashboard" });
    tabs = visitTab(tabs, { path: "/users", title: "Người dùng" });
    expect(tabs.map((t) => t.title)).toEqual(["Dashboard", "Người dùng"]);
    tabs = visitTab(tabs, { path: "/a", title: "A" }, 3);
    expect(visitTab(tabs, { path: "/b", title: "B" }, 3).map((t) => t.path)).toEqual(["/", "/a", "/b"]);
  });
  it("closes one, the others, the left, the right or all, and never home", () => {
    const tabs = ["/", "/a", "/b", "/c"].map((path) => ({ path, title: path }));
    const paths = (r: { tabs: { path: string }[] }) => r.tabs.map((t) => t.path);
    expect(closeTabs(tabs, "close", "/b", "/b")).toEqual({ tabs: [tabs[0], tabs[1], tabs[3]], go: "/c" });
    expect(closeTabs(tabs, "close", "/c", "/c").go).toBe("/b");
    expect(paths(closeTabs(tabs, "others", "/b", "/b"))).toEqual(["/", "/b"]);
    expect(paths(closeTabs(tabs, "left", "/b", "/b"))).toEqual(["/", "/b", "/c"]);
    expect(closeTabs(tabs, "right", "/a", "/c")).toEqual({ tabs: [tabs[0], tabs[1]], go: "/a" });
    expect(closeTabs(tabs, "all", "/a", "/b")).toEqual({ tabs: [tabs[0]], go: "/" });
    expect(paths(closeTabs(tabs, "close", "/", "/"))).toEqual(["/", "/a", "/b", "/c"]);
  });
  it("reads stored tabs and drops broken ones", () => {
    expect(readTabs('[{"path":"/","title":"Home"},{"path":3},null]')).toEqual([{ path: "/", title: "Home" }]);
    expect(readTabs("nope")).toEqual([]);
  });
});

describe("shell parts", () => {
  it("names the bell with the unread count and marks unread rows in words", () => {
    const html = renderToStaticMarkup(
      <I18nProvider locale="en">
        <Notifications notices={seedNotices()} onRead={() => {}} initialOpen />
      </I18nProvider>,
    );
    expect(html).toContain('aria-label="Notifications, 3 unread"');
    expect(html).toContain("Mark all as read");
    expect(html.match(/>Unread</g)).toHaveLength(3);
  });
  it("says all caught up when nothing is unread", () => {
    const html = renderToStaticMarkup(
      <I18nProvider locale="vi">
        <Notifications notices={seedNotices().map((n) => ({ ...n, read: true }))} onRead={() => {}} initialOpen />
      </I18nProvider>,
    );
    expect(html).toContain("Bạn đã xem hết thông báo");
    expect(html).not.toContain("Đánh dấu đã đọc hết");
  });
  it("preferences hold theme icons, language and four layout switches", () => {
    const html = renderToStaticMarkup(
      <I18nProvider locale="en">
        <PreferencesDrawer prefs={DEFAULT_PREFS} onPrefs={() => {}} theme="dark" onTheme={() => {}} onClose={() => {}} modal={false} />
      </I18nProvider>,
    );
    expect(html.match(/role="switch"/g)).toHaveLength(4);
    expect(html).toContain("x-theme-icons");
    expect(html).toContain("Page tabs");
    expect(html).toContain("Tiếng Việt");
  });
});
