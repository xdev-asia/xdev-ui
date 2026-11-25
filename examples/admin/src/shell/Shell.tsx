import { Suspense, useEffect, useLayoutEffect, useRef, useState, type JSX, type MouseEvent, type ReactNode } from "react";
import { AppShell, Banner, Breadcrumb, BrandMark, Button, Icon, IconButton, Menu, MenuButton, NavList, Popover, Spinner, TabStrip, ThemeSwitch, type MenuEntry, type ThemePreference } from "@xdev-asia/ui";
import { inFrame, type Session } from "../auth/session";
import { seedNotices, type Notice } from "../data/catalog";
import type { Role } from "../data/seed";
import { LOCALES, useI18n, type Locale } from "../i18n";
import { hrefFor, navigate, type Route } from "../router";
import { AccountMenu } from "./AccountMenu";
import { GlobalSearch } from "./GlobalSearch";
import { useStore } from "../data/context";
import { currentOf, fitSections, leaves, navFor, toItems, type NavNode } from "./nav";
import { buildId, ROOT_VARS, rootStyle, watermarkUrl } from "./appearance";
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
  /** Paths the back-end access mode switched off; their entries leave the menu. */
  hidden?: ReadonlySet<string>;
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

/** True from the drawer breakpoint (768px) up; the top, mixed and two-column layouts apply only there. */
function useWide(): boolean {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia?.("(min-width: 48rem)");
    if (!mq) return;
    const sync = (): void => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return wide;
}

/** Accent, radius, widths and the colour filters on <html>, so every part and portal follows. */
function useAppearance(prefs: Prefs): void {
  useEffect(() => {
    const root = document.documentElement;
    const { vars, filter } = rootStyle(prefs);
    for (const name of ROOT_VARS) {
      const value = vars[name];
      if (value) root.style.setProperty(name, value);
      else root.style.removeProperty(name);
    }
    root.style.filter = filter;
  }, [prefs]);
  useEffect(
    () => () => {
      const root = document.documentElement;
      for (const name of ROOT_VARS) root.style.removeProperty(name);
      root.style.filter = "";
    },
    [],
  );
}

/** True once the deployed index.html points at another build than the one running; checked every minute. */
function useUpdateCheck(enabled: boolean): boolean {
  const [stale, setStale] = useState(false);
  useEffect(() => {
    const running = document.querySelector<HTMLScriptElement>('script[type="module"][src*="/assets/"]')?.getAttribute("src");
    if (!enabled || !running) return;
    const check = (): void => {
      fetch(window.location.pathname, { cache: "no-store" })
        .then((r) => (r.ok ? r.text() : ""))
        .then((html) => {
          const live = buildId(html);
          if (live && live !== running) setStale(true);
        })
        .catch(() => {});
    };
    const id = window.setInterval(check, 60_000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return stale;
}

/** The first page under a menu section, where choosing the section goes. */
const firstPage = (n: NavNode): NavNode | undefined => (n.children ? leaves([n]).find((l) => !l.entry.external)?.entry : n);

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
  const topNavRef = useRef<HTMLElement | null>(null);
  const wide = useWide();
  const stale = useUpdateCheck(prefs.checkUpdates);
  useAppearance(prefs);

  const tree = navFor(roles, session.role, undefined, p.hidden);
  const here = currentOf(route);
  // Phones always get the whole menu in the drawer; the other layouts start at the drawer breakpoint.
  const layout = wide ? prefs.navStyle : "side";
  const topId = here ? (here.trail[0]?.id ?? here.entry.id) : null;
  const section = tree.find((n) => n.id === topId);
  const sideless = wide && (!prefs.sidebar || layout === "top" || (layout === "mixed" && !section?.children));
  // Settings sections share one tab, the way a page's own sub-views do.
  const tabPath = route.name === "settings" ? hrefFor.settings().slice(1) : route.path;
  const iconOf = (path: string) => leaves(tree).find((l) => l.entry.href === `#${path}`)?.entry.icon;
  // A user's page is titled with their name once the store answers; the id stands in until then.
  const store = useStore();
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const userId = route.name === "user" ? (route.params.id ?? "") : "";
  useEffect(() => {
    if (!userId || userNames[userId]) return;
    store.getUser(userId).then((u) => setUserNames((m) => ({ ...m, [userId]: u.name })), () => {});
  }, [userId, store, userNames]);
  const title = userId ? (userNames[userId] ?? userId) : here ? t(here.entry.label) : t("app.notFoundTitle");
  /** A tab's title in the current language: menu pages are translated again on every render, users keep their name. */
  const tabTitle = (tab: OpenPage): string => {
    if (tab.path === HOME) return t("nav.dashboard");
    const leaf = leaves(tree).find((l) => l.entry.href === `#${tab.path}`);
    if (leaf) return t(leaf.entry.label);
    const id = /^\/users\/(.+)$/.exec(tab.path)?.[1];
    return (id && userNames[id]) || tab.title;
  };
  const homeTitle = t("nav.dashboard");

  // Page tabs survive a reload within this browser tab (sessionStorage) while "keep tabs" is on. A console in a device
  // preview frame shares that storage with the page around it, so it keeps its tabs to itself.
  const keepTabs = prefs.tabsPersist && !inFrame();
  useEffect(() => {
    if (p.initialTabs || !keepTabs) return;
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
        { path: tabPath, title },
      );
    });
  }, [route.path, route.name, title, homeTitle]);
  useEffect(() => {
    if (inFrame()) return;
    try {
      if (keepTabs) window.sessionStorage.setItem(TABS_KEY, JSON.stringify(tabs));
      else window.sessionStorage.removeItem(TABS_KEY);
    } catch {
      /* private mode */
    }
  }, [tabs, keepTabs]);
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

  // Top menu: sections that do not fit go into a "More" menu, so no label is ever cut. Items stay in the DOM while
  // hidden (visibility, not display) so their widths can be measured again when the bar grows.
  const [fit, setFit] = useState<number[] | null>(null);
  const topIndex = tree.findIndex((n) => n.id === topId);
  useLayoutEffect(() => {
    const nav = topNavRef.current;
    if (!nav) return setFit(null);
    const measure = (): void => {
      const items = Array.from(nav.querySelectorAll<HTMLElement>("[data-topnav-item]"));
      const more = nav.querySelector<HTMLElement>("[data-topnav-more]")?.offsetWidth || 36;
      setFit(fitSections(items.map((el) => el.offsetWidth), nav.clientWidth, more, 4, topIndex));
    };
    measure();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    ro?.observe(nav);
    return () => ro?.disconnect();
  }, [layout, topIndex, tree.length, locale]);

  // Keep the current page's tab in view when the strip is wider than the screen (no scrollIntoView: it would move the page).
  useEffect(() => {
    const strip = stripRef.current?.querySelector<HTMLElement>(".ws-tabstrip");
    const tab = strip?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.closest<HTMLElement>(".ws-tab");
    if (!strip || !tab) return;
    const s = strip.getBoundingClientRect();
    const r = tab.getBoundingClientRect();
    if (r.left < s.left) strip.scrollLeft -= s.left - r.left;
    else if (r.right > s.right) strip.scrollLeft += r.right - s.right;
  }, [route.path, tabs]);

  const act = (action: TabAction, target: string): void => {
    setTabMenu(null);
    const next = closeTabs(tabs, action, target, tabPath);
    setTabs(next.tabs);
    if (next.go) navigate(`#${next.go}`);
  };
  // Right-click on a tab opens the same menu as the chevron, for that tab.
  const onTabContext = (e: MouseEvent<HTMLDivElement>): void => {
    if (!prefs.tabsMore) return;
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
      { label: t("shell.reloadPage"), disabled: path !== tabPath, onSelect: () => { setTabMenu(null); setReload((n) => n + 1); } },
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
  const navList = (items: NavNode[], label?: string) => (
    <NavList
      accordion={prefs.accordion}
      title={label}
      labels={ui.navList}
      value={here?.entry.id}
      onSelect={() => setNavOpen(false)}
      renderLink={({ item, ...link }) => <a {...link} {...(externals.has(item.id) ? { target: "_blank", rel: "noreferrer" } : {})} />}
      items={toItems(items, t)}
    />
  );
  // Top layout: a section opens a menu of its pages; nested branches become groups.
  const menuOf = (nodes: NavNode[]): MenuEntry[] =>
    nodes.flatMap<MenuEntry>((n) =>
      n.children
        ? [{ type: "group", label: t(n.label) }, ...menuOf(n.children)]
        : [n.external ? { label: t(n.label), onSelect: () => window.open(n.href, "_blank", "noopener") } : { label: t(n.label), href: n.href, checked: n.id === here?.entry.id }],
    );
  const topNav =
    layout === "top" || layout === "mixed" ? (
      <nav className="app-topnav" aria-label={t("shell.topNav")} ref={topNavRef}>
        {tree.map((n, i) => {
          const current = n.id === topId;
          const off = fit !== null && !fit.includes(i);
          // The current section is the one with a border; the rest are borderless.
          return (
            <span key={n.id} className="app-topnav-item" data-topnav-item="" data-off={off ? "" : undefined} aria-hidden={off || undefined}>
              {layout === "top" && n.children ? (
                <MenuButton label={t(n.label)} variant={current ? "secondary" : "ghost"} items={menuOf(n.children)} disabled={off} />
              ) : (
                <Button href={firstPage(n)?.href} variant={current ? "secondary" : "ghost"} tabIndex={off ? -1 : undefined} aria-current={current ? (n.children ? "true" : "page") : undefined}>
                  {t(n.label)}
                </Button>
              )}
            </span>
          );
        })}
        {fit !== null && fit.length < tree.length ? (
          <span data-topnav-more="">
            <MenuButton
              label={t("shell.more")}
              variant="icon"
              icon="more"
              align="end"
              items={tree
                .filter((_, i) => !fit.includes(i))
                .flatMap<MenuEntry>((n) => (layout === "top" && n.children ? [{ type: "group", label: t(n.label) }, ...menuOf(n.children)] : [{ label: t(n.label), href: firstPage(n)?.href }]))}
            />
          </span>
        ) : null}
      </nav>
    ) : null;
  const sideNav =
    layout === "mixed" ? (
      section?.children ? navList(section.children, t(section.label)) : navList(tree)
    ) : layout === "two-column" ? (
      <div className="app-twocol" style={{ gridTemplateColumns: `${prefs.columnWidth}px minmax(0, 1fr)` }}>
        <nav aria-label={t("shell.sections")}>
          <ul className="app-twocol-sections">
            {tree.map((n) => (
              <li key={n.id}>
                <a className="app-twocol-section" href={firstPage(n)?.href} aria-current={n.id === topId ? (n.children ? "true" : "page") : undefined} title={t(n.label)}>
                  <Icon name={n.icon} size={18} />
                  <span>{t(n.label)}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {section?.children ? navList(section.children, t(section.label)) : null}
      </div>
    ) : (
      navList(tree)
    );
  const year = prefs.copyrightYear.trim();
  const crumbs = [
    ...(here ? [...here.trail.map((b) => ({ label: t(b.label) })), { label: t(here.entry.label), href: here.entry.href }] : []),
    ...(route.name === "user" ? [{ label: route.params.id, mono: true }] : []),
  ];

  return (
    <AppShell
      labels={ui.appShell}
      navOpen={navOpen}
      onNavOpenChange={setNavOpen}
      navCollapsed={prefs.collapsed && layout !== "two-column"}
      navHidden={sideless}
      sideTheme={prefs.sideTheme === "auto" ? undefined : prefs.sideTheme}
      chromeHidden={focusView}
      toasts={p.toasts}
      brand={
        <>
          <BrandMark size={20} />
          <span translate="no">{t("app.name")}</span>
        </>
      }
      nav={sideNav}
      navFooter={
        // The fold button sits at the foot of the sidebar, as in react-antd-admin; the drawer on phones has no rail.
        layout === "two-column" ? undefined : <span className="app-wide-only app-nav-fold">
          <IconButton
            icon="sidebar"
            label={prefs.collapsed ? ui.appShell.expandNav : ui.appShell.collapseNav}
            aria-expanded={!prefs.collapsed}
            onClick={() => p.onPrefs({ ...prefs, collapsed: !prefs.collapsed })}
          />
        </span>
      }
      crumbs={topNav ?? (prefs.crumbs && crumbs.length ? <Breadcrumb className="app-wide-only app-crumbs" items={crumbs} labels={ui.breadcrumb} /> : undefined)}
      actions={
        <>
          <GlobalSearch tree={tree} recent={tabs.filter((x) => x.path !== tabPath)} />
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
      {prefs.progress ? <div key={`progress-${route.path}-${reload}`} className="app-progress" aria-hidden="true" /> : null}
      {stale ? (
        <div className="app-update">
          <Banner tone="info" title={t("shell.updateTitle")} action={<Button variant="secondary" icon="refresh" onClick={() => window.location.reload()}>{t("shell.reload")}</Button>}>
            {t("shell.updateHint")}
          </Banner>
        </div>
      ) : null}
      {prefs.tabs && tabs.length ? (
        <div className="app-tabs">
          <div className="app-tabs-strip" ref={stripRef} onContextMenu={onTabContext}>
            <TabStrip
              label={t("shell.openPages")}
              labels={ui.tabStrip}
              tabs={tabs.map((tab) => ({ id: tab.path, name: tabTitle(tab), pinned: tab.path === HOME, icon: prefs.tabsIcons ? iconOf(tab.path) : undefined }))}
              variant={prefs.tabsStyle}
              onReorder={prefs.tabsDraggable ? (ids) => setTabs((list) => ids.flatMap((id) => list.filter((x) => x.path === id))) : undefined}
              selected={tabPath}
              onSelect={(path) => navigate(`#${path}`)}
              onClose={(path) => act("close", path)}
              onAdd={false}
            />
          </div>
          <div className="app-tabs-tools">
            <IconButton icon="refresh" label={t("shell.reloadPage")} onClick={() => setReload((n) => n + 1)} />
            {prefs.tabsMaximize || focusView ? (
              <IconButton icon={focusView ? "minimize" : "maximize"} label={focusView ? t("shell.exitFocus") : t("shell.focus")} aria-pressed={focusView} onClick={() => setFocusView(!focusView)} />
            ) : null}
            {prefs.tabsMore ? (
              <Popover
                open={tabMenu !== null}
                onClose={() => setTabMenu(null)}
                placement="bottom-end"
                label={t("shell.tabActions")}
                trigger={(a) => <IconButton icon="chevron" label={t("shell.tabActions")} onClick={() => setTabMenu(tabMenu === null ? tabPath : null)} {...a} />}
              >
                <Menu label={t("shell.tabActions")} items={menuFor(tabMenu ?? tabPath)} onClose={() => setTabMenu(null)} />
              </Popover>
            ) : null}
          </div>
        </div>
      ) : null}
      {/* A new key remounts the page, so "Reload page" fetches it again without reloading the app; the transition replays. */}
      <div key={`${route.path}-${reload}`} className="app-page" data-transition={prefs.transition ? prefs.transitionName : undefined}>
        <Suspense fallback={prefs.loading ? <div className="app-pane"><Spinner size="md" label={t("shell.loadingPage")} /></div> : null}>{p.children}</Suspense>
      </div>
      {/* Room at the end of the page, so the back-to-top button never sits on the last row or the pagination. */}
      {prefs.backToTop ? <div className="app-back-top-room" aria-hidden="true" /> : null}
      {prefs.footer && !focusView ? (
        <footer className="app-footer" data-fixed={prefs.fixedFooter ? "" : undefined}>
          {year || prefs.company ? (
            <span>
              © {year ? `${year} ` : ""}
              {prefs.companySite ? (
                <a href={prefs.companySite} target="_blank" rel="noreferrer">
                  {prefs.company || prefs.companySite}
                </a>
              ) : (
                prefs.company
              )}
            </span>
          ) : null}
          <span>{t("shell.builtWith")}</span>
          {prefs.icp ? (prefs.icpLink ? <a href={prefs.icpLink} target="_blank" rel="noreferrer">{prefs.icp}</a> : <span>{prefs.icp}</span>) : null}
          <a href={hrefFor.legal("privacy")}>{t("legal.privacy")}</a>
          <a href={hrefFor.legal("terms")}>{t("legal.terms")}</a>
        </footer>
      ) : null}
      {prefs.watermark && prefs.watermarkText.trim() ? <div className="app-watermark" aria-hidden="true" style={{ maskImage: watermarkUrl(prefs.watermarkText.trim()), WebkitMaskImage: watermarkUrl(prefs.watermarkText.trim()) }} /> : null}
      {prefs.backToTop && far ? (
        <span className="app-back-top">
          <IconButton icon="arrow-up" size="lg" label={t("shell.backToTop")} onClick={() => document.getElementById("main")?.scrollTo({ top: 0 })} />
        </span>
      ) : null}
      {prefsOpen ? <PreferencesDrawer prefs={prefs} onPrefs={p.onPrefs} theme={p.theme} onTheme={p.onThemeChange} onClose={() => setPrefsOpen(false)} onSignOut={p.onSignOut} /> : null}
    </AppShell>
  );
}
