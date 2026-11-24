import { Fragment, useEffect, useState, type JSX, type ReactNode } from "react";
import { AppShell, Breadcrumb, BrandMark, IconButton, MenuButton, NavList, TabStrip, ThemeSwitch, type ThemePreference } from "@xdev-asia/ui";
import type { Session } from "../auth/session";
import { seedNotices, type Notice } from "../data/catalog";
import type { Role } from "../data/seed";
import { LOCALES, useI18n, type Locale } from "../i18n";
import { hrefFor, navigate, type Route } from "../router";
import { AccountMenu } from "./AccountMenu";
import { GlobalSearch } from "./GlobalSearch";
import { currentOf, navFor } from "./nav";
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

/** The theme on screen: the preference, or the system's while the preference is "system". */
function resolvedTheme(pref: ThemePreference): "dark" | "light" {
  if (pref !== "system") return pref;
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function Shell(p: ShellProps): JSX.Element {
  const { route, session, roles } = p;
  const { t, ui, locale, setLocale } = useI18n();
  const [navOpen, setNavOpen] = useState(p.initialNavOpen ?? false);
  const [prefsOpen, setPrefsOpen] = useState(p.initialPrefsOpen ?? false);
  const [focusView, setFocusView] = useState(p.initialFocusView ?? false);
  const [notices, setNotices] = useState<Notice[]>(() => p.notices ?? seedNotices());
  const [tabs, setTabs] = useState<OpenPage[]>(p.initialTabs ?? []);
  const [reload, setReload] = useState(0);
  const [fullscreen, toggleFullscreen] = useFullscreen();

  const groups = navFor(roles, session.role);
  const here = currentOf(route);
  const title = route.name === "user" ? route.params.id : here ? t(here.entry.label) : t("app.notFoundTitle");
  const homeTitle = t("nav.dashboard");

  // Page tabs survive a reload within this browser tab (sessionStorage), like the open pages of a desktop app.
  useEffect(() => {
    if (p.initialTabs) return;
    try {
      const stored = readTabs(window.sessionStorage.getItem(TABS_KEY));
      if (stored.length) setTabs((list) => stored.reduce((acc, x) => visitTab(acc, x), list));
    } catch {
      /* storage blocked: start empty */
    }
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
      window.sessionStorage.setItem(TABS_KEY, JSON.stringify(tabs));
    } catch {
      /* private mode */
    }
  }, [tabs]);
  // The browser tab names the page, so history, bookmarks and the window switcher say where you are.
  useEffect(() => {
    document.title = `${title} · ${t("app.name")}`;
  }, [title, t]);
  // Esc leaves the focus view, the way it leaves full screen.
  useEffect(() => {
    if (!focusView) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !e.defaultPrevented) setFocusView(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [focusView]);

  const act = (action: TabAction, target = route.path): void => {
    const next = closeTabs(tabs, action, target, route.path);
    setTabs(next.tabs);
    if (next.go) navigate(`#${next.go}`);
  };
  const at = tabs.findIndex((x) => x.path === route.path);

  const crumbs = [
    ...(here ? [{ label: t(here.group.title) }, { label: t(here.entry.label), href: here.entry.href }] : []),
    ...(route.name === "user" ? [{ label: route.params.id, mono: true }] : []),
  ];

  return (
    <AppShell
      labels={ui.appShell}
      navOpen={navOpen}
      onNavOpenChange={setNavOpen}
      navCollapsed={p.prefs.collapsed}
      onNavCollapsedChange={(collapsed) => p.onPrefs({ ...p.prefs, collapsed })}
      chromeHidden={focusView}
      toasts={p.toasts}
      brand={
        <>
          <BrandMark size={20} />
          <span translate="no">{t("app.name")}</span>
        </>
      }
      nav={groups.map((g) => {
        const holdsCurrent = g.id === here?.group.id;
        // The key remounts a closed group when the current page moves into it, so it opens.
        return (
          <NavList
            key={g.collapsible ? `${g.id}-${holdsCurrent}` : g.id}
            title={t(g.title)}
            collapsible={g.collapsible}
            defaultOpen={g.collapsible ? holdsCurrent : true}
            labels={ui.navList}
            value={holdsCurrent ? here?.entry.id : undefined}
            onSelect={() => setNavOpen(false)}
            renderLink={({ item, ...link }) => {
              const external = g.items.find((e) => e.id === item.id)?.external;
              return <a {...link} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} />;
            }}
            items={g.items.map((e) => ({ id: e.id, label: t(e.label), icon: e.icon, href: e.href }))}
          />
        );
      })}
      crumbs={p.prefs.crumbs && crumbs.length ? <Breadcrumb className="app-wide-only" items={crumbs} labels={ui.breadcrumb} /> : undefined}
      actions={
        <>
          <GlobalSearch groups={groups} recent={tabs.filter((x) => x.path !== route.path)} />
          <Notifications notices={notices} onRead={(ids) => setNotices((list) => list.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)))} />
          <MenuButton
            variant="icon"
            icon="globe"
            label={t("shell.language")}
            align="end"
            className="app-wide-only"
            items={LOCALES.map((l) => ({ label: LANGUAGE_NAMES[l], checked: l === locale, onSelect: () => setLocale(l) }))}
          />
          {/* Language, theme and full screen are also in preferences, so a phone's top bar keeps only four controls. */}
          <span className="app-wide-only">
            <ThemeSwitch variant="icon" value={p.theme} resolved={resolvedTheme(p.theme)} onChange={p.onThemeChange} labels={ui.themeSwitch} />
          </span>
          <IconButton className="app-wide-only" icon={fullscreen ? "minimize" : "maximize"} label={fullscreen ? t("shell.exitFullscreen") : t("shell.fullscreen")} onClick={toggleFullscreen} />
          <IconButton icon="sliders" label={t("shell.preferences")} aria-haspopup="dialog" onClick={() => setPrefsOpen(true)} />
          <AccountMenu session={session} onProfile={() => navigate(hrefFor.profile())} onSettings={() => navigate(hrefFor.settings())} onSignOut={p.onSignOut} />
        </>
      }
    >
      {p.prefs.tabs && tabs.length ? (
        <div className="app-tabs">
          <div className="app-tabs-strip">
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
          <div className="app-tabs-tools">
            <IconButton icon="refresh" label={t("shell.reloadPage")} onClick={() => setReload((n) => n + 1)} />
            <IconButton icon={focusView ? "minimize" : "maximize"} label={focusView ? t("shell.exitFocus") : t("shell.focus")} aria-pressed={focusView} onClick={() => setFocusView(!focusView)} />
            <MenuButton
              variant="icon"
              icon="chevron"
              label={t("shell.tabActions")}
              align="end"
              items={[
                { label: t("shell.closeTab"), disabled: at < 0 || tabs[at]?.path === HOME, onSelect: () => act("close") },
                { type: "separator" },
                { label: t("shell.closeLeft"), disabled: !tabs.slice(0, Math.max(at, 0)).some((x) => x.path !== HOME), onSelect: () => act("left") },
                { label: t("shell.closeRight"), disabled: at < 0 || at >= tabs.length - 1, onSelect: () => act("right") },
                { type: "separator" },
                { label: t("shell.closeOthers"), disabled: !tabs.some((x, i) => i !== at && x.path !== HOME), onSelect: () => act("others") },
                { label: t("shell.closeAll"), disabled: !tabs.some((x) => x.path !== HOME), onSelect: () => act("all") },
              ]}
            />
          </div>
        </div>
      ) : null}
      {/* A new key remounts the page, so "Reload page" fetches it again without reloading the app. */}
      <Fragment key={`${route.path}-${reload}`}>{p.children}</Fragment>
      {p.prefs.footer && !focusView ? <footer className="app-footer">{t("shell.footer")}</footer> : null}
      {prefsOpen ? <PreferencesDrawer prefs={p.prefs} onPrefs={p.onPrefs} theme={p.theme} onTheme={p.onThemeChange} onClose={() => setPrefsOpen(false)} /> : null}
    </AppShell>
  );
}
