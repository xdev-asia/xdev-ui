import { Fragment, useEffect, useRef, useState, type JSX, type MouseEvent, type ReactNode } from "react";
import { AppShell, Breadcrumb, BrandMark, IconButton, Menu, MenuButton, NavList, Popover, TabStrip, ThemeSwitch, type ThemePreference } from "@xdev-asia/ui";
import type { Session } from "../auth/session";
import { seedNotices, type Notice } from "../data/catalog";
import type { Role } from "../data/seed";
import { LOCALES, useI18n, type Locale } from "../i18n";
import { hrefFor, navigate, type Route } from "../router";
import { AccountMenu } from "./AccountMenu";
import { GlobalSearch } from "./GlobalSearch";
import { currentOf, leaves, navFor, toItems } from "./nav";
import { Notifications } from "./Notifications";
import { PreferencesDrawer } from "./PreferencesDrawer";
import { closeTabs, HOME, readTabs, visitTab, type OpenPage, type Prefs, type TabAction } from "./prefs";

const TABS_KEY = "acme-tabs";
const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };

export interface ShellProps {
  route: Route;
  session: Session;
  roles: Role[];
  toasts?: ReactNode;
  onSignOut: () => void;
  children: ReactNode;
  prefs: Prefs;
  onPrefs: (next: Prefs) => void;
  theme: ThemePreference;
  onThemeChange: (value: ThemePreference) => void;
  /** Starting state, for tests and screenshots. */
  initialNavOpen?: boolean;
  initialTabs?: OpenPage[];
  initialPrefsOpen?: boolean;
  initialFocusView?: boolean;
  notices?: Notice[];
}

function useFullscreen(): [boolean, () => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = (): void => setOn(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  const toggle = (): void => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  };
  return [on, toggle];
}

/** True once `main` (the shell's scroller) has scrolled past one screen. */
function useScrolledFar(enabled: boolean): boolean {
  const [far, setFar] = useState(false);
  useEffect(() => {
    const main = document.getElementById("main");
    if (!enabled || !main) return setFar(false);
    const sync = (): void => setFar(main.scrollTop > main.clientHeight);
    main.addEventListener("scroll", sync, { passive: true });
    return () => main.removeEventListener("scroll", sync);
  }, [enabled]);
  return far;
}

/** The theme on screen: the preference, or the system's while the preference is "system". */
function resolvedTheme(pref: ThemePreference): "dark" | "light" {
  if (pref !== "system") return pref;
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function Shell(p: ShellProps): JSX.Element {
  const { route, session, roles, prefs } = p;
  const { t, ui, locale, setLocale } = useI18n();
  const [navOpen, setNavOpen] = useState(p.initialNavOpen ?? false);
  const [prefsOpen, setPrefsOpen] = useState(p.initialPrefsOpen ?? false);
  const [focusView, setFocusView] = useState(p.initialFocusView ?? false);
  const [notices, setNotices] = useState<Notice[]>(() => p.notices ?? seedNotices());
  const [tabs, setTabs] = useState<OpenPage[]>(p.initialTabs ?? []);
  const [tabMenu, setTabMenu] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [fullscreen, toggleFullscreen] = useFullscreen();
  const far = useScrolledFar(prefs.backToTop);
  const stripRef = useRef<HTMLDivElement | null>(null);

  const tree = navFor(roles, session.role);
  const here = currentOf(route);
  const title = route.name === "user" ? (route.params.id ?? "") : here ? t(here.entry.label) : t("app.notFoundTitle");
  const homeTitle = t("nav.dashboard");

  // Page tabs survive a reload within this browser tab (sessionStorage) while "keep tabs" is on.
  useEffect(() => {
    if (p.initialTabs || !prefs.tabsPersist) return;
    try {
      const stored = readTabs(window.sessionStorage.getItem(TABS_KEY));
      if (stored.length) setTabs((list) => stored.reduce((acc, x) => visitTab(acc, x), list));
    } catch {
      /* storage blocked: start empty */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.initialTabs]);
  useEffect(() => {
    // The sign-in route shows for a moment after signing in, before the redirect; it is not a page to keep.
    if (route.name === "sign-in") return;
    setTabs((list) => {
      const withHome = list.some((x) => x.path === HOME) ? list : visitTab(list, { path: HOME, title: homeTitle });
      return visitTab(
        withHome.map((x) => (x.path === HOME ? { ...x, title: homeTitle } : x)),
        { path: route.path, title },
      );
    });
  }, [route.path, route.name, title, homeTitle]);
  useEffect(() => {
    try {
      if (prefs.tabsPersist) window.sessionStorage.setItem(TABS_KEY, JSON.stringify(tabs));
      else window.sessionStorage.removeItem(TABS_KEY);
    } catch {
      /* private mode */
    }
  }, [tabs, prefs.tabsPersist]);
  // The browser tab names the page, so history, bookmarks and the window switcher say where you are.
  useEffect(() => {
    document.title = prefs.dynamicTitle ? `${title} · ${t("app.name")}` : t("app.name");
  }, [title, t, prefs.dynamicTitle]);
  // Esc leaves the focus view, the way it leaves full screen.
  useEffect(() => {
    if (!focusView) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !e.defaultPrevented) setFocusView(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [focusView]);

  const act = (action: TabAction, target: string): void => {
    setTabMenu(null);
    const next = closeTabs(tabs, action, target, route.path);
    setTabs(next.tabs);
    if (next.go) navigate(`#${next.go}`);
  };
  // Right-click on a tab opens the same menu as the chevron, for that tab.
  const onTabContext = (e: MouseEvent<HTMLDivElement>): void => {
    const tab = (e.target as HTMLElement).closest('[role="tab"]');
    const at = tab ? Array.from(stripRef.current?.querySelectorAll('[role="tab"]') ?? []).indexOf(tab) : -1;
    const hit = tabs[at];
    if (!hit) return;
    e.preventDefault();
    setTabMenu(hit.path);
  };
  const menuFor = (path: string) => {
    const at = tabs.findIndex((x) => x.path === path);
    return [
      { label: t("shell.reloadPage"), disabled: path !== route.path, onSelect: () => { setTabMenu(null); setReload((n) => n + 1); } },
      { type: "separator" as const },
      { label: t("shell.closeTab"), disabled: at < 0 || path === HOME, onSelect: () => act("close", path) },
      { label: t("shell.closeLeft"), disabled: !tabs.slice(0, Math.max(at, 0)).some((x) => x.path !== HOME), onSelect: () => act("left", path) },
      { label: t("shell.closeRight"), disabled: at < 0 || at >= tabs.length - 1, onSelect: () => act("right", path) },
      { type: "separator" as const },
      { label: t("shell.closeOthers"), disabled: !tabs.some((x, i) => i !== at && x.path !== HOME), onSelect: () => act("others", path) },
      { label: t("shell.closeAll"), disabled: !tabs.some((x) => x.path !== HOME), onSelect: () => act("all", path) },
    ];
  };

  const externals = new Set(leaves(tree).filter((l) => l.entry.external).map((l) => l.entry.id));
  const crumbs = [
    ...(here ? [...here.trail.map((b) => ({ label: t(b.label) })), { label: t(here.entry.label), href: here.entry.href }] : []),
    ...(route.name === "user" ? [{ label: route.params.id, mono: true }] : []),
  ];

  return (
    <AppShell
      labels={ui.appShell}
      navOpen={navOpen}
      onNavOpenChange={setNavOpen}
      navCollapsed={prefs.collapsed}
      chromeHidden={focusView}
      toasts={p.toasts}
      brand={
        <>
          <BrandMark size={20} />
          <span translate="no">{t("app.name")}</span>
        </>
      }
      nav={
        <NavList
          accordion
          labels={ui.navList}
          value={here?.entry.id}
          onSelect={() => setNavOpen(false)}
          renderLink={({ item, ...link }) => <a {...link} {...(externals.has(item.id) ? { target: "_blank", rel: "noreferrer" } : {})} />}
          items={toItems(tree, t)}
        />
      }
      navFooter={
        // The fold button sits at the foot of the sidebar, as in react-antd-admin; the drawer on phones has no rail.
        <span className="app-wide-only app-nav-fold">
          <IconButton
            icon="sidebar"
            label={prefs.collapsed ? ui.appShell.expandNav : ui.appShell.collapseNav}
            aria-expanded={!prefs.collapsed}
            onClick={() => p.onPrefs({ ...prefs, collapsed: !prefs.collapsed })}
          />
        </span>
      }
      crumbs={prefs.crumbs && crumbs.length ? <Breadcrumb className="app-wide-only" items={crumbs} labels={ui.breadcrumb} /> : undefined}
      actions={
        <>
          <GlobalSearch tree={tree} recent={tabs.filter((x) => x.path !== route.path)} />
          <IconButton icon="settings" label={t("shell.preferences")} aria-haspopup="dialog" onClick={() => setPrefsOpen(true)} />
          {/* Theme, language and full screen are also in preferences, so a phone's top bar keeps only four controls. */}
          <span className="app-wide-only">
            <ThemeSwitch variant="icon" value={p.theme} resolved={resolvedTheme(p.theme)} onChange={p.onThemeChange} labels={ui.themeSwitch} />
          </span>
          <MenuButton
            variant="icon"
            icon="globe"
            label={t("shell.language")}
            align="end"
            className="app-wide-only"
            items={LOCALES.map((l) => ({ label: LANGUAGE_NAMES[l], checked: l === locale, onSelect: () => setLocale(l) }))}
          />
          <IconButton className="app-wide-only" icon={fullscreen ? "minimize" : "maximize"} label={fullscreen ? t("shell.exitFullscreen") : t("shell.fullscreen")} onClick={toggleFullscreen} />
          <Notifications notices={notices} onRead={(ids) => setNotices((list) => list.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)))} />
          <AccountMenu session={session} onProfile={() => navigate(hrefFor.profile())} onSettings={() => navigate(hrefFor.settings())} onSignOut={p.onSignOut} />
        </>
      }
    >
      {prefs.tabs && tabs.length ? (
        <div className="app-tabs">
          <div className="app-tabs-strip" ref={stripRef} onContextMenu={onTabContext}>
            <TabStrip
              label={t("shell.openPages")}
              labels={ui.tabStrip}
              tabs={tabs.map((tab) => ({ id: tab.path, name: tab.title, pinned: tab.path === HOME }))}
              selected={route.path}
              onSelect={(path) => navigate(`#${path}`)}
              onClose={(path) => act("close", path)}
              onAdd={false}
            />
          </div>
          {prefs.tabsTools ? (
            <div className="app-tabs-tools">
              <IconButton icon="refresh" label={t("shell.reloadPage")} onClick={() => setReload((n) => n + 1)} />
              <IconButton icon={focusView ? "minimize" : "maximize"} label={focusView ? t("shell.exitFocus") : t("shell.focus")} aria-pressed={focusView} onClick={() => setFocusView(!focusView)} />
              <Popover
                open={tabMenu !== null}
                onClose={() => setTabMenu(null)}
                placement="bottom-end"
                label={t("shell.tabActions")}
                trigger={(a) => <IconButton icon="chevron" label={t("shell.tabActions")} onClick={() => setTabMenu(tabMenu === null ? route.path : null)} {...a} />}
              >
                <Menu label={t("shell.tabActions")} items={menuFor(tabMenu ?? route.path)} onClose={() => setTabMenu(null)} />
              </Popover>
            </div>
          ) : null}
        </div>
      ) : null}
      {/* A new key remounts the page, so "Reload page" fetches it again without reloading the app. */}
      <Fragment key={`${route.path}-${reload}`}>{p.children}</Fragment>
      {prefs.footer && !focusView ? (
        <footer className="app-footer">
          <span>{t("shell.footer")}</span>
          <a href={hrefFor.legal("privacy")}>{t("legal.privacy")}</a>
          <a href={hrefFor.legal("terms")}>{t("legal.terms")}</a>
        </footer>
      ) : null}
      {prefs.backToTop && far ? (
        <span className="app-back-top">
          <IconButton icon="arrow-up" size="lg" label={t("shell.backToTop")} onClick={() => document.getElementById("main")?.scrollTo({ top: 0 })} />
        </span>
      ) : null}
      {prefsOpen ? <PreferencesDrawer prefs={prefs} onPrefs={p.onPrefs} theme={p.theme} onTheme={p.onThemeChange} onClose={() => setPrefsOpen(false)} onSignOut={p.onSignOut} /> : null}
    </AppShell>
  );
}
