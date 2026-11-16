import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { AppShell, AttentionInbox, Banner, BottomNav, Breadcrumb, BrandMark, CommandPalette, Dialog, NavList, PaletteTrigger, Select, ServiceStatus, StatusBar, Tag, ThemeSwitch, useBreakpoint } from "@xdev-asia/ui";
import { AGENTS } from "./data";
import { I18nProvider, readLocale, useI18n, type Locale } from "./i18n";
import { NotifyContext, useNotify, useToasts } from "./notify";
import { AccountsPage } from "./pages/Accounts";
import { ApprovalsPage } from "./pages/Approvals";
import { DevicesPage } from "./pages/Devices";
import { DocumentsPage } from "./pages/Documents";
import { NotFoundPage } from "./pages/NotFound";
import { PairPage } from "./pages/Pair";
import { ProjectsPage } from "./pages/Projects";
import { RunsPage } from "./pages/Runs";
import { SettingsPage } from "./pages/Settings";
import { WorkspacePage } from "./pages/Workspace";
import { NewSessionDialog } from "./parts/NewSessionDialog";
import { SessionList } from "./parts/SessionList";
import { href, navigate, useRoute } from "./router";
import { StoreProvider, inProject, pending, useAttention, useStore } from "./store";
import { useTheme } from "./theme";

const LOCALE_KEY = "xdev-showcase-locale";

function Shell({ toasts }: { toasts: React.ReactNode }): JSX.Element {
  const { t, ui } = useI18n();
  const s = useStore();
  const notify = useNotify();
  const route = useRoute();
  const [theme, setTheme] = useTheme();
  const [navOpen, setNavOpen] = useState(false);
  const [newSession, setNewSession] = useState(false);
  const [palette, setPalette] = useState(false);
  const [inbox, setInbox] = useState(false);
  // A phone's top bar holds three actions at most: the search trigger stays on wider screens (Ctrl K still opens it).
  const bp = useBreakpoint();
  const wide = bp !== "base";
  // The search trigger needs a wide bar; the server's name needs a bar beside a fixed sidebar.
  const roomy = bp === "xl" || bp === "2xl";
  const mid = roomy || bp === "lg";
  const attention = useAttention();
  // Requests of every project count: a person must not miss one because another project is chosen.
  const waiting = pending(s.approvals).length;
  const termCounts = (["working", "waiting", "idle", "done", "failed"] as const)
    .map((state) => ({ state, n: s.terminals.filter((x) => x.state === state).length }))
    .filter((x) => x.n > 0)
    .map((x) => `${x.n} ${ui.sessionState[x.state].toLowerCase()}`)
    .join(" · ");
  const session = s.sessions.find((x) => x.id === s.sessionId);

  // The tab's title carries how many things wait for a person.
  useEffect(() => {
    document.title = attention.length > 0 ? `(${attention.length}) ${t("app.name")}` : t("app.name");
  }, [attention.length, t]);

  // With the person's consent, the browser says when one more thing starts waiting.
  const known = useRef(attention.length);
  useEffect(() => {
    if (s.notifications && attention.length > known.current) {
      try {
        new Notification(t("notify.title"), { body: attention[attention.length - 1]?.text });
      } catch {
        /* the browser took the consent back */
      }
    }
    known.current = attention.length;
  }, [attention, s.notifications, t]);

  // A lost connection comes back by itself; the page then shows the current state again.
  const { online, setOnline } = s;
  useEffect(() => {
    if (online) return;
    const timer = setTimeout(() => {
      setOnline(true);
      notify(t("conn.restored"));
    }, 4000);
    return () => clearTimeout(timer);
  }, [online, setOnline, notify, t]);

  // Text in the document editor that was not saved: leaving the Documents page asks first.
  const draftDoc = s.draft ? s.docs.find((d) => d.id === s.draft?.doc) : undefined;
  const draftDirty = Boolean(s.draft && draftDoc && s.draft.text !== draftDoc.versions[draftDoc.versions.length - 1]?.text);

  const work = [
    { id: "workspace", label: t("nav.workspace"), icon: "terminal" as const, href: href.workspace },
    { id: "runs", label: t("nav.runs"), icon: "workflow" as const, href: href.runs, count: s.runs.filter((r) => inProject(s.project, r.project)).length },
    { id: "documents", label: t("nav.documents"), icon: "docs" as const, href: href.documents, count: s.docs.filter((d) => inProject(s.project, d.project)).length },
    { id: "approvals", label: t("nav.approvals"), icon: "inbox" as const, href: href.approvals, count: waiting },
  ];
  const manage = [
    { id: "projects", label: t("nav.projects"), icon: "folder-git" as const, href: href.projects, count: s.projects.length },
    { id: "accounts", label: t("nav.accounts"), icon: "accounts" as const, href: href.accounts, count: s.accounts.length },
    { id: "devices", label: t("nav.devices"), icon: "plug" as const, href: href.devices, count: s.peers.length },
    { id: "settings", label: t("nav.settings"), icon: "settings" as const, href: href.settings },
  ];
  const pages = [...work, ...manage];
  const current = pages.find((i) => i.id === route);
  const close = (): void => setNavOpen(false);

  const pickProject = (name: string): void => {
    s.setProject(name);
    // Keep the open session inside the chosen project.
    const first = s.sessions.find((x) => x.project === name);
    if (name && session?.project !== name && first) s.setSessionId(first.id);
    s.setDocId(null);
  };

  // On a phone the picker sits at the top of the drawer: the top bar keeps the menu, the inbox and the theme.
  const projectPicker = (
    <Select
      className="app-fill"
      aria-label={t("side.project")}
      icon="folder-git"
      value={s.project}
      onChange={(e) => pickProject(e.target.value)}
      options={[{ value: "", label: t("side.allProjects") }, ...s.projects.map((p) => ({ value: p.name, label: p.name }))]}
    />
  );

  if (!s.paired) return <PairPage />;

  return (
    <AppShell
      labels={ui.appShell}
      navOpen={navOpen}
      onNavOpenChange={setNavOpen}
      toasts={toasts}
      brand={
        <>
          <BrandMark size={20} />
          <span>{t("app.name")}</span>
        </>
      }
      nav={
        <>
          {wide ? null : <div className="app-side-picker">{projectPicker}</div>}
          <NavList title={t("nav.main")} labels={ui.navList} value={current?.id} onSelect={close} items={work} />
          <NavList title={t("nav.manage")} labels={ui.navList} value={current?.id} onSelect={close} items={manage} />
          <SessionList onPick={close} onNew={() => setNewSession(true)} />
        </>
      }
      bottomNav={
        <BottomNav
          labels={ui.bottomNav}
          value={current?.id}
          onChange={(id) => navigate(pages.find((x) => x.id === id)?.href ?? href.workspace)}
          items={work.map((x) => ({ id: x.id, label: x.label, icon: x.icon, badge: x.id === "approvals" ? waiting : undefined }))}
          more={{ label: t("nav.more"), icon: "more", items: manage.map((x) => ({ id: x.id, label: x.label, icon: x.icon })) }}
        />
      }
      navFooter={<ServiceStatus tone={s.online ? "ok" : "warn"} label={s.online ? "build-box" : t("conn.offline")} detail="xdevd 0.1.0" />}
      crumbs={<Breadcrumb items={current ? [{ label: current.label, href: current.href }] : []} labels={ui.breadcrumb} />}
      actions={
        <>
          {roomy ? (
            <div className="app-top-search">
              <PaletteTrigger onOpen={() => setPalette(true)} labels={{ search: t("palette.title") }} />
            </div>
          ) : null}
          {mid ? <Tag tone={s.online ? "default" : "warn"}>{`${t("conn.server", { name: "build-box" })} · ${t(s.online ? "conn.online" : "conn.offline")}`}</Tag> : s.online ? null : <Tag tone="warn">{t("conn.offline")}</Tag>}
          {wide ? projectPicker : null}
          <AttentionInbox
            items={attention}
            now={s.now}
            labels={ui.attentionInbox}
            open={inbox}
            onOpenChange={setInbox}
            onOpen={(id) => {
              setInbox(false);
              if (id.startsWith("run-")) {
                s.setRunId(id);
                navigate(href.runs);
              } else {
                s.setApprovalId(id);
                navigate(href.approvals);
              }
            }}
          />
          <ThemeSwitch variant="icon" value={theme} onChange={setTheme} labels={ui.themeSwitch} />
        </>
      }
    >
      <div className="app-page">
        {!s.online ? (
          <Banner tone="warn" title={t("conn.lost")}>
            {t("conn.lostHint")}
          </Banner>
        ) : null}
        <div className="app-page-body">
          {route === "workspace" ? (
            <WorkspacePage />
          ) : route === "runs" ? (
            <RunsPage />
          ) : route === "documents" ? (
            <DocumentsPage />
          ) : route === "approvals" ? (
            <ApprovalsPage />
          ) : route === "projects" ? (
            <ProjectsPage />
          ) : route === "accounts" ? (
            <AccountsPage accounts={s.accounts} setAccounts={s.setAccounts} defaults={s.defaults} setDefaults={s.setDefaults} />
          ) : route === "devices" ? (
            <DevicesPage />
          ) : route === "settings" ? (
            <SettingsPage theme={theme} onThemeChange={setTheme} />
          ) : (
            <NotFoundPage />
          )}
        </div>
        <StatusBar
          items={[
            <span key="v">xdevd 0.1.0</span>,
            session ? <span key="b">{`${session.project} / ${session.branch}`}</span> : null,
            <span key="w">{t("status.terms", { list: termCounts || t("status.noTerms") })}</span>,
            "spacer",
            <span key="d">{t("status.defaults", { list: AGENTS.map((a) => `${a.name}: ${s.accounts.find((x) => x.id === s.defaults[a.id])?.name ?? t("status.none")}`).join(" · ") })}</span>,
            <span key="r">{t("status.role", { role: t(`roles.${s.role}`) })}</span>,
          ]}
        />
      </div>
      {newSession ? <NewSessionDialog onClose={() => setNewSession(false)} /> : null}
      {draftDirty && draftDoc && route !== "documents" ? (
        <Dialog
          alert
          modal
          busy={false}
          tone="danger"
          title={t("docs.leaveTitle", { file: draftDoc.file })}
          confirmLabel={t("docs.discard")}
          cancelLabel={t("docs.leaveBack")}
          onCancel={() => {
            s.setProject(draftDoc.project);
            s.setDocId(draftDoc.id);
            navigate(href.documents);
          }}
          onConfirm={() => s.setDraft(null)}
        >
          {t("docs.leaveBody")}
        </Dialog>
      ) : null}
      <CommandPalette
        open={palette}
        title={t("palette.title")}
        placeholder={t("palette.placeholder")}
        labels={ui.commandPalette}
        onClose={() => setPalette(false)}
        onSelect={(row) => {
          const id = row.id ?? "";
          if (id.startsWith("page:")) navigate(pages.find((x) => x.id === id.slice(5))?.href ?? href.workspace);
          else if (id.startsWith("run:")) {
            s.setRunId(id.slice(4));
            navigate(href.runs);
          } else if (id.startsWith("session:")) {
            s.setSessionId(id.slice(8));
            navigate(href.workspace);
          }
          setPalette(false);
        }}
        sections={[
          { title: t("palette.sessions"), rows: s.sessions.map((x) => ({ id: `session:${x.id}`, title: `${x.project} / ${x.branch}`, state: x.status })) },
          { title: t("palette.runs"), rows: s.runs.map((r) => ({ id: `run:${r.id}`, title: r.title, detail: r.project, icon: "workflow" as const })) },
          { title: t("palette.pages"), rows: pages.map((x) => ({ id: `page:${x.id}`, title: x.label, icon: x.icon })) },
        ]}
      />
    </AppShell>
  );
}

function Toasted(): JSX.Element {
  const { notify, toasts } = useToasts();
  return (
    <NotifyContext.Provider value={notify}>
      <StoreProvider>
        <Shell toasts={toasts} />
      </StoreProvider>
    </NotifyContext.Provider>
  );
}

export function App(): JSX.Element {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => {
    try {
      setLocaleState(readLocale(window.localStorage.getItem(LOCALE_KEY)));
    } catch {
      /* keep the default */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(LOCALE_KEY, l);
    } catch {
      /* private mode */
    }
  }, []);
  return (
    <I18nProvider locale={locale} onLocaleChange={setLocale}>
      <Toasted />
    </I18nProvider>
  );
}
