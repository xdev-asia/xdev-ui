import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { AgentChip, AppShell, Banner, BottomNav, Breadcrumb, BrandMark, Button, CommandPalette, Dialog, IconButton, Meter, NavList, PaletteTrigger, Select, ServiceStatus, Stack, StatusBar, Tabs, Tag, ThemeSwitch, useBreakpoint } from "@xdev-asia/ui";
import { AGENTS } from "./data";
import { I18nProvider, readLocale, useI18n, type Locale } from "./i18n";
import { NotifyContext, useNotify, useToasts } from "./notify";
import { AccountsPage } from "./pages/Accounts";
import { DevicesPage } from "./pages/Devices";
import { ConfigAgentsPage } from "./pages/ConfigAgents";
import { ConfigPipelinesPage } from "./pages/ConfigPipelines";
import { ConfigRulesPage } from "./pages/ConfigRules";
import { ConfigTemplatesPage } from "./pages/ConfigTemplates";
import { DocumentsPage } from "./pages/Documents";
import { HistoryPage, InboxPage } from "./pages/Inbox";
import { KnowledgePage } from "./pages/Knowledge";
import { NotFoundPage } from "./pages/NotFound";
import { PairPage } from "./pages/Pair";
import { ProjectsPage } from "./pages/Projects";
import { STAGE_KEY } from "./pages/run-keys";
import { RunsPage } from "./pages/Runs";
import { SettingsPage } from "./pages/Settings";
import { SquadsPage } from "./pages/Squads";
import { WorkspacePage } from "./pages/Workspace";
import { NewSessionDialog } from "./parts/NewSessionDialog";
import { SessionList } from "./parts/SessionList";
import { SETTINGS_ROUTES, href, navigate, useRoute } from "./router";
import { StoreProvider, inProject, showInWorkspace, useAttention, useStore } from "./store";
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
  const bp = useBreakpoint();
  // The search trigger and the quota need a wide top bar; Ctrl K opens the search on any width.
  const roomy = bp === "xl" || bp === "2xl";
  const wide = bp !== "base";
  const attention = useAttention();
  const termCounts = (["working", "waiting", "idle", "done", "failed"] as const)
    .map((state) => ({ state, n: s.terminals.filter((x) => x.state === state).length }))
    .filter((x) => x.n > 0)
    .map((x) => `${x.n} ${ui.sessionState[x.state].toLowerCase()}`)
    .join(" · ");
  const session = s.sessions.find((x) => x.id === s.sessionId);
  const sessionRun = session ? s.runs.find((r) => r.project === session.project && r.branch === session.branch) : undefined;

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

  // The sidebar's shortcuts; worktrees follow them. Managing the server lives in the settings area.
  const shortcuts = [
    { id: "inbox", label: t("nav.inbox"), icon: "inbox" as const, href: href.inbox, count: attention.length },
    { id: "runs", label: t("nav.runs"), icon: "workflow" as const, href: href.runs, count: s.runs.filter((r) => inProject(s.project, r.project)).length },
    { id: "squads", label: t("nav.squads"), icon: "bot" as const, href: href.squads, count: s.squads.filter((q) => inProject(s.project, q.project)).length },
    { id: "documents", label: t("nav.documents"), icon: "docs" as const, href: href.documents, count: s.docs.filter((d) => inProject(s.project, d.project)).length },
    { id: "knowledge", label: t("nav.knowledge"), icon: "layers" as const, href: href.knowledge, count: s.knowledge.filter((r) => inProject(s.project, r.project)).reduce((n, r) => n + r.files.length, 0) },
  ];
  const settingsPages = [
    { id: "projects", label: t("nav.projects"), icon: "folder-git" as const, href: href.projects },
    { id: "accounts", label: t("nav.accounts"), icon: "accounts" as const, href: href.accounts },
    { id: "devices", label: t("nav.devices"), icon: "plug" as const, href: href.devices },
    { id: "agents", label: t("settingsArea.agents"), icon: "bot" as const, href: href.agents },
    { id: "pipelines", label: t("settingsArea.pipelines"), icon: "workflow" as const, href: href.pipelines },
    { id: "templates", label: t("settingsArea.templates"), icon: "layers" as const, href: href.templates },
    { id: "rules", label: t("settingsArea.rules"), icon: "shield" as const, href: href.rules },
    { id: "settings", label: t("settingsArea.preferences"), icon: "settings" as const, href: href.settings },
  ];
  const pages = [{ id: "workspace", label: t("nav.workspace"), icon: "terminal" as const, href: href.workspace }, ...shortcuts, { id: "history", label: t("nav.history"), icon: "history" as const, href: href.history }, ...settingsPages];
  const current = pages.find((i) => i.id === route);
  const inSettings = SETTINGS_ROUTES.includes(route);
  const close = (): void => setNavOpen(false);

  const pickProject = (name: string): void => {
    s.setProject(name);
    // Keep the open session inside the chosen project.
    const first = s.sessions.find((x) => x.project === name);
    if (name && session?.project !== name && first) s.setSessionId(first.id);
    s.setDocId(null);
  };

  // The quota of the default account of each agent, when the CLI reports it. 80% and up warns.
  const quotas = AGENTS.map((a) => ({ agent: a, account: s.accounts.find((x) => x.id === s.defaults[a.id]) })).filter((q) => q.account?.usage !== undefined);

  const crumbs =
    route === "workspace" && session
      ? [{ label: session.project }, { label: session.branch }, ...(sessionRun ? [{ label: t("top.runOf", { title: sessionRun.title, stage: t(STAGE_KEY[sessionRun.stage]) }) }] : [])]
      : inSettings
        ? [{ label: t("settingsArea.title"), href: href.projects }, ...(current ? [{ label: current.label }] : [])]
        : current
          ? [{ label: current.label, href: current.href }]
          : [];

  if (!s.paired) return <PairPage />;

  const page =
    route === "workspace" ? (
      <WorkspacePage />
    ) : route === "inbox" ? (
      <InboxPage />
    ) : route === "history" ? (
      <HistoryPage />
    ) : route === "runs" ? (
      <RunsPage />
    ) : route === "squads" ? (
      <SquadsPage />
    ) : route === "documents" ? (
      <DocumentsPage />
    ) : route === "knowledge" ? (
      <KnowledgePage />
    ) : route === "projects" ? (
      <ProjectsPage />
    ) : route === "accounts" ? (
      <AccountsPage accounts={s.accounts} setAccounts={s.setAccounts} defaults={s.defaults} setDefaults={s.setDefaults} />
    ) : route === "devices" ? (
      <DevicesPage />
    ) : route === "agents" ? (
      <ConfigAgentsPage />
    ) : route === "pipelines" ? (
      <ConfigPipelinesPage />
    ) : route === "templates" ? (
      <ConfigTemplatesPage />
    ) : route === "rules" ? (
      <ConfigRulesPage />
    ) : route === "settings" ? (
      <SettingsPage theme={theme} onThemeChange={setTheme} />
    ) : (
      <NotFoundPage />
    );

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
          <div className="app-side-picker">
            <Select
              className="app-fill"
              aria-label={t("side.project")}
              icon="folder-git"
              value={s.project}
              onChange={(e) => pickProject(e.target.value)}
              options={[{ value: "", label: t("side.allProjects") }, ...s.projects.map((p) => ({ value: p.name, label: p.name }))]}
            />
          </div>
          <NavList title={t("nav.shortcuts")} labels={ui.navList} value={current?.id} onSelect={close} items={shortcuts} />
          <SessionList onPick={close} onNew={() => setNewSession(true)} />
        </>
      }
      bottomNav={
        <BottomNav
          labels={ui.bottomNav}
          value={inSettings && route !== "projects" ? "settings" : current?.id}
          onChange={(id) => navigate(pages.find((x) => x.id === id)?.href ?? href.workspace)}
          items={[
            { id: "workspace", label: t("nav.workspace"), icon: "terminal" },
            { id: "inbox", label: t("nav.inbox"), icon: "inbox", badge: attention.length },
            { id: "projects", label: t("nav.projects"), icon: "folder-git" },
            { id: "history", label: t("nav.history"), icon: "history" },
            { id: "settings", label: t("nav.openSettings"), icon: "settings" },
          ]}
        />
      }
      navFooter={
        <div className="app-side-foot">
          <ServiceStatus tone={s.online ? "ok" : "warn"} label={s.online ? "build-box" : t("conn.offline")} detail="xdevd 0.1.0" />
          <IconButton
            icon="settings"
            label={t("nav.openSettings")}
            onClick={() => {
              close();
              navigate(href.projects);
            }}
          />
        </div>
      }
      crumbs={<Breadcrumb items={crumbs} labels={ui.breadcrumb} />}
      actions={
        <>
          {roomy ? (
            <div className="app-top-search">
              <PaletteTrigger onOpen={() => setPalette(true)} labels={{ search: t("palette.title") }} />
            </div>
          ) : null}
          {s.online ? null : <Tag tone="warn">{t("conn.offline")}</Tag>}
          <Button variant={attention.length > 0 ? "secondary" : "ghost"} size="sm" icon="inbox" className="app-needs" data-warn={attention.length > 0 ? "" : undefined} onClick={() => navigate(href.inbox)}>
            {attention.length > 0 ? t("top.needsYou", { n: attention.length }) : wide ? t("top.nothing") : ""}
          </Button>
          {roomy
            ? quotas.map(({ agent, account }) => (
                <span key={agent.id} className="app-quota" title={t("top.quota", { agent: agent.name, account: account?.name ?? "", n: account?.usage ?? 0 })}>
                  <AgentChip profile={agent.profile} title={agent.name} />
                  <Meter value={account?.usage ?? 0} warnAt={80} valueText={`${account?.usage ?? 0}%`} />
                  <span className="x-sr-only">{t("top.quota", { agent: agent.name, account: account?.name ?? "", n: account?.usage ?? 0 })}</span>
                </span>
              ))
            : null}
          <ThemeSwitch variant="icon" value={theme} onChange={setTheme} labels={ui.themeSwitch} />
        </>
      }
    >
      {!s.online ? (
        <Banner tone="warn" title={t("conn.lost")}>
          {t("conn.lostHint")}
        </Banner>
      ) : null}
      <div className="app-shell-body">
        <div className="app-page-body" data-wide={route === "workspace" ? "" : undefined}>
          {inSettings ? (
            <Stack gap={4}>
              <Tabs label={t("settingsArea.sections")} value={route} onChange={(id) => navigate(settingsPages.find((x) => x.id === id)?.href ?? href.projects)} items={settingsPages.map((x) => ({ id: x.id, label: x.label }))} />
              {page}
            </Stack>
          ) : (
            page
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
          } else if (id.startsWith("squad:")) {
            s.setSquadId(id.slice(6));
            navigate(href.squads);
          } else if (id.startsWith("session:")) showInWorkspace(s, id.slice(8));
          setPalette(false);
        }}
        sections={[
          // Worktrees that need a person first, then the ones at work, then the rest.
          { title: t("palette.sessions"), rows: [...s.sessions].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status)).map((x) => ({ id: `session:${x.id}`, title: `${x.project} / ${x.branch}`, state: x.status })) },
          { title: t("palette.runs"), rows: s.runs.map((r) => ({ id: `run:${r.id}`, title: r.title, detail: r.project, icon: "workflow" as const })) },
          { title: t("nav.squads"), rows: s.squads.map((q) => ({ id: `squad:${q.id}`, title: q.name, detail: q.project, icon: "bot" as const })) },
          { title: t("palette.pages"), rows: pages.map((x) => ({ id: `page:${x.id}`, title: x.label, icon: x.icon })) },
        ]}
      />
    </AppShell>
  );
}

/** Order of worktrees in the jump list: the ones that need a person on top. */
const ORDER = ["waiting", "failed", "working", "done", "idle", "exited"];

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
