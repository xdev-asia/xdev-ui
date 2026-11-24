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
import { closeTabs, DEFAULT_PREFS, readPrefs, readTabs, visitTab, type Prefs } from "./prefs";
import { accentOf, buildId, onAccent, rootStyle, watermarkUrl } from "./appearance";
import { Shell } from "./Shell";
import { StoreContext } from "../data/context";
import { createStore } from "../data/store";

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
    expect(readPrefs('{"navStyle":"diagonal","radius":99,"sideWidth":200,"customColor":"red","preset":"gold","tabsStyle":"card"}')).toEqual({ ...DEFAULT_PREFS, sideWidth: 200, preset: "gold", tabsStyle: "card" });
    expect(readPrefs("[1]")).toEqual(DEFAULT_PREFS);
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
    expect(html.match(/role="switch"/g)).toHaveLength(21);
    for (const s of ["General", "Theme", "Layout", "Sidebar", "Tabs", "Animation", "Footer", "Menu position", "Two columns", "Accent colour", "Corner radius", "Tab style", "Fade and slide", "Watermark text", "ICP number"]) expect(html).toContain(s);
    expect(html).not.toContain("Custom accent");
    expect(html).toContain("x-theme-icons");
    expect(html).toContain("Page tabs");
    expect(html).toContain("Tiếng Việt");
  });
});

describe("appearance", () => {
  it("maps presets to an accent and picks readable text on it", () => {
    expect(accentOf(DEFAULT_PREFS)).toBeNull();
    expect(accentOf({ preset: "geekblue", customColor: "#000000" })).toBe("#2f54eb");
    expect(accentOf({ preset: "custom", customColor: "#123456" })).toBe("#123456");
    expect(onAccent("#2f54eb")).toBe("#ffffff");
    expect(onAccent("#fadb14")).toBe("#141414");
    expect(onAccent("#f5222d")).toBe("#ffffff");
    expect(onAccent("#52c41a")).toBe("#141414");
  });
  it("sets only the vars that differ from the stylesheet, plus the colour filters", () => {
    expect(rootStyle(DEFAULT_PREFS)).toEqual({ vars: {}, filter: "" });
    const s = rootStyle({ ...DEFAULT_PREFS, preset: "red", radius: 4, sideWidth: 220, railWidth: 48, colorWeak: true, gray: true });
    expect(s.vars).toMatchObject({ "--accent": "#f5222d", "--x-color-on-accent": "#ffffff", "--radius-l": "4px", "--x-radius-lg": "6px", "--w-side": "220px", "--w-rail": "48px" });
    expect(s.filter).toBe("invert(100%) grayscale(100%)");
  });
  it("escapes the watermark text and finds the build script of an index.html", () => {
    expect(decodeURIComponent(watermarkUrl('<b>"x"</b>'))).toContain("&#60;b&#62;&#34;x&#34;&#60;/b&#62;");
    expect(buildId('<script type="module" crossorigin src="/showcase/admin/assets/index-abc.js"></script>')).toBe("/showcase/admin/assets/index-abc.js");
    expect(buildId('<script type="module" src="/src/main.tsx"></script>')).toBeNull();
  });
});

describe("Shell layouts", () => {
  const session = { name: "Ada Lovelace", email: "admin@example.com", role: "owner" as const };
  const shell = (prefs: Partial<Prefs>, hash = "#/roles") =>
    renderToStaticMarkup(
      <StoreContext.Provider value={createStore()}>
      <I18nProvider locale="en">
        <Shell route={matchRoute(hash)} session={session} roles={roles} onSignOut={() => {}} prefs={{ ...DEFAULT_PREFS, ...prefs }} onPrefs={() => {}} theme="dark" onThemeChange={() => {}} initialTabs={[{ path: "/", title: "Dashboard" }, { path: "/roles", title: "Roles" }]} notices={[]}>
          <p>page</p>
        </Shell>
      </I18nProvider>
      </StoreContext.Provider>,
    );
  it("side: the whole menu in the sidebar, breadcrumb in the top bar, no top menu", () => {
    const html = shell({});
    expect(html).not.toContain("app-topnav");
    expect(html).not.toContain("data-nav-hidden");
    expect(html).toContain("ws-crumbs");
    expect(html).toContain('data-transition="fade-slide"');
    expect(html).toContain("app-progress");
  });
  it("top: sections in the top bar as menus, the sidebar hidden on wide screens", () => {
    const html = shell({ navStyle: "top" });
    expect(html).toContain('class="app-topnav" aria-label="Main menu"');
    expect(html).toContain("data-nav-hidden");
    expect(html).toContain('class="x-shell-top-brand"');
    expect(html).toContain('aria-haspopup="menu"');
  });
  it("mixed: sections in the top bar, the current section's pages in the sidebar", () => {
    const html = shell({ navStyle: "mixed" });
    expect(html).toMatch(/aria-current="true"[^>]*>.*System/);
    expect(html).toContain('aria-label="System"');
    expect(html).not.toContain("data-nav-hidden");
    expect(shell({ navStyle: "mixed" }, "#/")).toContain("data-nav-hidden");
  });
  it("two columns: a column of sections, then the section's pages; no fold button", () => {
    const html = shell({ navStyle: "two-column" });
    expect(html).toContain("app-twocol-sections");
    expect(html).toMatch(/class="app-twocol-section" href="#\/users" aria-current="true"/);
    expect(html).not.toContain("app-nav-fold");
  });
  it("tabs, sidebar theme, footer, watermark and animation follow the preferences", () => {
    const html = shell({ tabsStyle: "brisk", sideTheme: "light", fixedFooter: true, watermark: true, transition: false, progress: false, icp: "ICP 1", tabsMore: false, tabsMaximize: false });
    expect(html).toContain('data-variant="brisk"');
    expect(html).toMatch(/draggable="true"/);
    expect(html).toMatch(/<aside[^>]*data-theme="light"/);
    expect(html).toContain('<footer class="app-footer" data-fixed="">');
    expect(html).toContain('href="https://ui.xdev.asia/"');
    expect(html).toContain("ICP 1");
    expect(html).toContain("app-watermark");
    expect(html).not.toContain("data-transition");
    expect(html).not.toContain("app-progress");
    expect(html).not.toContain("Tab actions");
    expect(html).not.toContain("Focus view");
  });
});
