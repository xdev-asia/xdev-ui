import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { seedNotices } from "../data/catalog";
import { seedRoles } from "../data/seed";
import { I18nProvider } from "../i18n";
import { matchRoute } from "../router";
import { canOpen, currentOf, leaves, NAV, navFor, toItems } from "./nav";
import { disabledPaths, seedMenus } from "../data/catalog";
import { Notifications } from "./Notifications";
import { PreferencesDrawer } from "./PreferencesDrawer";
import { closeTabs, DEFAULT_PREFS, readPrefs, readTabs, visitTab } from "./prefs";

const roles = seedRoles();

describe("nav", () => {
  const ids = (tree: ReturnType<typeof navFor>) => leaves(tree).map((l) => l.entry.id);
  it("follows the reference's order and drops leaves and branches a role cannot see", () => {
    expect(NAV.map((n) => n.id)).toEqual(["dashboard", "access", "nested", "outside", "exception", "system", "personal", "about"]);
    const viewer = ids(navFor(roles, "viewer"));
    expect(viewer).toContain("users");
    expect(viewer).not.toContain("roles");
    expect(viewer).toContain("access-common");
    expect(viewer).not.toContain("access-admin");
    expect(ids(navFor(roles, "owner"))).toContain("access-admin");
  });
  it("finds the current leaf with the branches above it, three levels deep", () => {
    expect(currentOf(matchRoute("#/users/u3"))?.entry.id).toBe("users");
    const deep = currentOf(matchRoute("#/nested/menu1-2"));
    expect(deep?.trail.map((b) => b.id)).toEqual(["nested", "menu1"]);
    expect(currentOf(matchRoute("#/exception/unknown"))?.entry.id).toBe("unknown");
    expect(currentOf(matchRoute("#/nope"))).toBeNull();
  });
  it("blocks a link to a page the role cannot read", () => {
    expect(canOpen(matchRoute("#/roles"), roles, "viewer")).toBe(false);
    expect(canOpen(matchRoute("#/access/admin"), roles, "viewer")).toBe(false);
    expect(canOpen(matchRoute("#/roles"), roles, "admin")).toBe(true);
    expect(canOpen(matchRoute("#/nope"), roles, "viewer")).toBe(true);
  });
  it("back-end mode drops the paths System, Menus switched off, from the menu and from links", () => {
    const hidden = disabledPaths(seedMenus());
    expect(hidden.has("/nested/menu2")).toBe(true);
    expect(ids(navFor(roles, "owner", undefined, hidden))).not.toContain("menu2");
    expect(ids(navFor(roles, "owner"))).toContain("menu2");
    expect(canOpen(matchRoute("#/nested/menu2"), roles, "owner", hidden)).toBe(false);
    expect(canOpen(matchRoute("#/nested/menu1-1"), roles, "owner", hidden)).toBe(true);
  });
  it("turns the tree into NavList items with children", () => {
    const items = toItems(NAV, (k) => k);
    expect(items.find((i) => i.id === "nested")?.children?.[0]?.children?.map((c) => c.id)).toEqual(["menu1-1", "menu1-2"]);
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
  it("preferences hold theme icons, language and the general and layout switches", () => {
    const html = renderToStaticMarkup(
      <I18nProvider locale="en">
        <PreferencesDrawer prefs={DEFAULT_PREFS} onPrefs={() => {}} theme="dark" onTheme={() => {}} onClose={() => {}} modal={false} />
      </I18nProvider>,
    );
    expect(html.match(/role="switch"/g)).toHaveLength(8);
    expect(html).toContain("x-theme-icons");
    expect(html).toContain("Page tabs");
    expect(html).toContain("Tiếng Việt");
  });
});
