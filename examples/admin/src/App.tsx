import { lazy, useCallback, useEffect, useMemo, useState, type JSX } from "react";
import type { ThemePreference } from "@xdev-asia/ui";
import { signIn, signOut, useSession, type Session } from "./auth/session";
import type { Role } from "./data/seed";
import { StoreContext, useStore } from "./data/context";
import { storeFromLocation, StoreError } from "./data/store";
import { I18nProvider, readLocale, useI18n, type Locale } from "./i18n";
import { hrefFor, navigate, useRoute, type AccessPage, type EmbedId, type ExceptionCode, type LegalPage, type NESTED } from "./router";
import { Shell } from "./shell/Shell";
import { canOpen } from "./shell/nav";
import { useFocusRescue } from "./parts/focus";
import { disabledPaths, seedMenus, type MenuItem, type TreeNode } from "./data/catalog";
import type { AccessMode } from "./pages/Access";
import { usePrefs } from "./shell/prefs";
import { LegalView } from "./pages/Legal";
import { NotifyContext, useNotify, useToasts } from "./shell/notify";
import { useTheme } from "./theme";
import { CreateUserDialog } from "./dialogs/CreateUserDialog";
import { DeleteUsersDialog } from "./dialogs/DeleteUsersDialog";
import { NotFoundPage } from "./pages/NotFound";
import type { User } from "./data/seed";
import { SignInPage } from "./pages/SignIn";

// Pages load on first visit; the shell's Suspense shows the loading indicator meanwhile.
const AboutPage = lazy(() => import("./pages/About").then((m) => ({ default: m.AboutPage })));
const DepartmentsPage = lazy(() => import("./pages/Departments").then((m) => ({ default: m.DepartmentsPage })));
const AuditLogPage = lazy(() => import("./pages/AuditLog").then((m) => ({ default: m.AuditLogPage })));
const DashboardPage = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.DashboardPage })));
const RolesPage = lazy(() => import("./pages/Roles").then((m) => ({ default: m.RolesPage })));
const SettingsPage = lazy(() => import("./pages/Settings").then((m) => ({ default: m.SettingsPage })));
const UserDetailPage = lazy(() => import("./pages/UserDetail").then((m) => ({ default: m.UserDetailPage })));
const UsersPage = lazy(() => import("./pages/Users").then((m) => ({ default: m.UsersPage })));
const MenusPage = lazy(() => import("./pages/Menus").then((m) => ({ default: m.MenusPage })));
const ProfilePage = lazy(() => import("./pages/Profile").then((m) => ({ default: m.ProfilePage })));
const DevicesPage = lazy(() => import("./pages/Devices").then((m) => ({ default: m.DevicesPage })));
const ExceptionPage = lazy(() => import("./pages/Exception").then((m) => ({ default: m.ExceptionPage })));
const AccessPageView = lazy(() => import("./pages/Access").then((m) => ({ default: m.AccessPageView })));
const EmbedPage = lazy(() => import("./pages/Demo").then((m) => ({ default: m.EmbedPage })));
const NestedPage = lazy(() => import("./pages/Demo").then((m) => ({ default: m.NestedPage })));

const LOCALE_KEY = "acme-locale";

type Dialog = { kind: "create" } | { kind: "delete"; users: Pick<User, "id" | "name">[]; done: () => void };

interface RoutesProps {
  session: Session;
  roles: Role[];
  version: number;
  openDialog: (d: Dialog) => void;
  onRolesChanged: () => void;
  theme: ThemePreference;
  onThemeChange: (value: ThemePreference) => void;
  access: AccessState;
}

/** The menu catalog and the access mode, shared by the Menus page, the access demo and the shell's menu. */
interface AccessState {
  menus: TreeNode<MenuItem>[];
  setMenus: (next: TreeNode<MenuItem>[]) => void;
  mode: AccessMode;
  setMode: (mode: AccessMode) => void;
  hidden: ReadonlySet<string>;
}

function Routes({ session, roles, version, openDialog, onRolesChanged, theme, onThemeChange, access }: RoutesProps): JSX.Element {
  const route = useRoute();
  // The sidebar hides what the role cannot read; a typed or shared link gets the not-found page, so it does not reveal the page.
  if (!canOpen(route, roles, session.role, access.hidden)) return <NotFoundPage />;
  const onDelete = (users: Pick<User, "id" | "name">[], done: () => void): void => openDialog({ kind: "delete", users, done });
  switch (route.name) {
    case "users":
      return <UsersPage session={session} roles={roles} version={version} onCreate={() => openDialog({ kind: "create" })} onDelete={onDelete} />;
    case "user":
      return <UserDetailPage key={route.params.id} id={route.params.id ?? ""} session={session} roles={roles} onDelete={onDelete} />;
    case "dashboard":
      return <DashboardPage />;
    case "roles":
      return <RolesPage session={session} roles={roles} onRolesChanged={onRolesChanged} />;
    case "settings":
      return <SettingsPage session={session} roles={roles} section={route.params.section} theme={theme} onThemeChange={onThemeChange} />;
    case "audit":
      return <AuditLogPage session={session} roles={roles} />;
    case "access":
      return <AccessPageView page={route.params.page as AccessPage} session={session} roles={roles} mode={access.mode} onModeChange={access.setMode} hidden={access.hidden} />;
    case "menus":
      return <MenusPage session={session} roles={roles} tree={access.menus} onTree={access.setMenus} />;
    case "departments":
      return <DepartmentsPage />;
    case "profile":
      return <ProfilePage session={session} />;
    case "about":
      return <AboutPage />;
    case "devices":
      return <DevicesPage session={session} roles={roles} hidden={access.hidden} theme={theme} />;
    case "exception":
      return <ExceptionPage code={route.params.code as ExceptionCode | "unknown"} />;
    case "nested":
      return <NestedPage leaf={route.params.leaf as (typeof NESTED)[number]} />;
    case "embed":
      return <EmbedPage id={route.params.id as EmbedId} />;
    default:
      return <NotFoundPage />;
  }
}

/** Hosts the modal dialogs so any page can open them. */
function Dialogs({ dialog, busy, setBusy, close, changed }: { dialog: Dialog | null; busy: boolean; setBusy: (b: boolean) => void; close: () => void; changed: () => void }): JSX.Element | null {
  const store = useStore();
  const { t } = useI18n();
  const notify = useNotify();
  if (!dialog) return null;
  if (dialog.kind === "create")
    return (
      <CreateUserDialog
        onCancel={close}
        onSubmit={async (input) => {
          try {
            await store.createUser(input);
            notify(t("createUser.created"));
            changed();
            close();
            return "ok";
          } catch (e) {
            return e instanceof StoreError && e.code === "email-taken" ? "email-taken" : "failed";
          }
        }}
      />
    );
  return (
    <DeleteUsersDialog
      users={dialog.users}
      busy={busy}
      onCancel={close}
      onConfirm={() => {
        setBusy(true);
        store.deleteUsers(dialog.users.map((u) => u.id)).then(
          () => {
            notify(dialog.users.length === 1 ? t("users.deletedOne") : t("users.deleted", { count: dialog.users.length }));
            dialog.done();
            changed();
          },
          () => notify(t("app.loadFailed")),
        ).finally(() => {
          setBusy(false);
          close();
        });
      }}
    />
  );
}

/** Everything under the language provider: toasts and pages read their words from it. */
function Console(): JSX.Element {
  const [theme, setTheme] = useTheme();
  const [menus, setMenus] = useState(seedMenus);
  const [mode, setMode] = useState<AccessMode>("front");
  const hidden = useMemo(() => (mode === "back" ? disabledPaths(menus) : new Set<string>()), [mode, menus]);
  const access: AccessState = { menus, setMenus, mode, setMode, hidden };
  const [prefs, setPrefs] = usePrefs();
  const session = useSession();
  const route = useRoute();
  const store = useMemo(() => storeFromLocation(typeof window === "undefined" ? "" : window.location.search), []);
  const [roles, setRoles] = useState<Role[]>([]);
  const { notify, toasts } = useToasts();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) store.listRoles().then(setRoles, () => setRoles([]));
  }, [session, store]);
  useEffect(() => {
    // Legal pages are public, as in react-antd-admin's whitelist; everything else asks to sign in first.
    if (route.name === "legal") return;
    if (!session && route.name !== "sign-in") navigate(hrefFor.signIn());
    if (session && route.name === "sign-in") navigate(hrefFor.dashboard());
  }, [session, route.name]);

  return (
    <StoreContext.Provider value={store}>
      <NotifyContext.Provider value={notify}>
        {route.name === "legal" ? (
          <LegalView page={route.params.page as LegalPage} signedIn={!!session} />
        ) : !session ? (
          <SignInPage onSignedIn={signIn} theme={theme} onThemeChange={setTheme} />
        ) : (
          <Shell route={route} session={session} roles={roles} toasts={toasts} onSignOut={signOut} prefs={prefs} onPrefs={setPrefs} theme={theme} onThemeChange={setTheme} hidden={hidden}>
            <Routes session={session} roles={roles} version={version} openDialog={setDialog} onRolesChanged={() => store.listRoles().then(setRoles, () => {})} theme={theme} onThemeChange={setTheme} access={access} />
            <Dialogs dialog={dialog} busy={busy} setBusy={setBusy} close={() => setDialog(null)} changed={() => setVersion((n) => n + 1)} />
          </Shell>
        )}
      </NotifyContext.Provider>
    </StoreContext.Provider>
  );
}

export function App(): JSX.Element {
  const [locale, setLocaleState] = useState<Locale>("en");
  useFocusRescue();

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
      <Console />
    </I18nProvider>
  );
}
