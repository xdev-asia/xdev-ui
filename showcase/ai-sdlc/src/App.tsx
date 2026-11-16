import { useCallback, useEffect, useState, type JSX } from "react";
import { AppShell, AttentionInbox, Breadcrumb, BrandMark, NavList, Select, ServiceStatus, ThemeSwitch } from "@xdev-asia/ui";
import { I18nProvider, readLocale, useI18n, type Locale } from "./i18n";
import { NotifyContext, useToasts } from "./notify";
import { AccountsPage } from "./pages/Accounts";
import { ApprovalsPage } from "./pages/Approvals";
import { DevicesPage } from "./pages/Devices";
import { DocumentsPage } from "./pages/Documents";
import { NotFoundPage } from "./pages/NotFound";
import { ProjectsPage } from "./pages/Projects";
import { RunsPage } from "./pages/Runs";
import { SettingsPage } from "./pages/Settings";
import { WorkspacePage } from "./pages/Workspace";
import { NewSessionDialog } from "./parts/NewSessionDialog";
import { SessionList } from "./parts/SessionList";
import { href, navigate, useRoute } from "./router";
import { StoreProvider, inProject, pending, projectOfLabel, useAttention, useStore } from "./store";
import { useTheme } from "./theme";

const LOCALE_KEY = "xdev-showcase-locale";

function Shell({ toasts }: { toasts: React.ReactNode }): JSX.Element {
  const { t, ui } = useI18n();
  const s = useStore();
  const route = useRoute();
  const [theme, setTheme] = useTheme();
  const [navOpen, setNavOpen] = useState(false);
  const [newSession, setNewSession] = useState(false);
  const attention = useAttention();
  const waiting = pending(s.approvals).filter((a) => inProject(s.project, projectOfLabel(a.session))).length;
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
  const current = [...work, ...manage].find((i) => i.id === route);
  const close = (): void => setNavOpen(false);
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
          <NavList title={t("nav.main")} labels={ui.navList} value={current?.id} onSelect={close} items={work} />
          <NavList title={t("nav.manage")} labels={ui.navList} value={current?.id} onSelect={close} items={manage} />
          <SessionList onPick={close} onNew={() => setNewSession(true)} />
        </>
      }
      navFooter={<ServiceStatus tone="ok" label="build-box" detail="xdevd 0.1.0" />}
      crumbs={<Breadcrumb items={current ? [{ label: current.label, href: current.href }] : []} labels={ui.breadcrumb} />}
      actions={
        <>
          <Select
            aria-label={t("side.project")}
            icon="folder-git"
            value={s.project}
            onChange={(e) => {
              const name = e.target.value;
              s.setProject(name);
              // Keep the open session inside the chosen project.
              const open = s.sessions.find((x) => x.id === s.sessionId);
              const first = s.sessions.find((x) => x.project === name);
              if (name && open?.project !== name && first) s.setSessionId(first.id);
              s.setDocId(null);
            }}
            options={[{ value: "", label: t("side.allProjects") }, ...s.projects.map((p) => ({ value: p.name, label: p.name }))]}
          />
          <AttentionInbox
            items={attention}
            now={s.now}
            labels={ui.attentionInbox}
            onOpen={(id) => {
              if (id.startsWith("run-")) {
                s.setRunId(id);
                navigate(href.runs);
              } else navigate(href.approvals);
            }}
          />
          <ThemeSwitch variant="icon" value={theme} onChange={setTheme} labels={ui.themeSwitch} />
        </>
      }
    >
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
        <SettingsPage accounts={s.accounts} defaults={s.defaults} setDefaults={s.setDefaults} theme={theme} onThemeChange={setTheme} />
      ) : (
        <NotFoundPage />
      )}
      {newSession ? <NewSessionDialog onClose={() => setNewSession(false)} /> : null}
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
