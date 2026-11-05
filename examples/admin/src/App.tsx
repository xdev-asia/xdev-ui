import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import type { ThemePreference } from "@xdev-asia/ui";
import { signIn, signOut, useSession, type Session } from "./auth/session";
import type { Role } from "./data/seed";
import { StoreContext, useStore } from "./data/context";
import { storeFromLocation, StoreError } from "./data/store";
import { I18nProvider, readLocale, useI18n, type Locale } from "./i18n";
import { hrefFor, navigate, useRoute } from "./router";
import { Shell } from "./shell/Shell";
import { NotifyContext, useNotify, useToasts } from "./shell/notify";
import { useTheme } from "./theme";
import { CreateUserDialog } from "./dialogs/CreateUserDialog";
import { DeleteUsersDialog } from "./dialogs/DeleteUsersDialog";
import { AuditLogPage } from "./pages/AuditLog";
import { DashboardPage } from "./pages/Dashboard";
import { NotFoundPage } from "./pages/NotFound";
import { RolesPage } from "./pages/Roles";
import { SettingsPage } from "./pages/Settings";
import { UserDetailPage } from "./pages/UserDetail";
import { UsersPage } from "./pages/Users";
import type { User } from "./data/seed";
import { SignInPage } from "./pages/SignIn";

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
}

function Routes({ session, roles, version, openDialog, onRolesChanged, theme, onThemeChange }: RoutesProps): JSX.Element {
  const route = useRoute();
  const onDelete = (users: Pick<User, "id" | "name">[], done: () => void): void => openDialog({ kind: "delete", users, done });
  switch (route.name) {
    case "users":
      return <UsersPage session={session} roles={roles} version={version} onCreate={() => openDialog({ kind: "create" })} onDelete={onDelete} />;
    case "user":
      return <UserDetailPage key={route.params.id} id={route.params.id} session={session} roles={roles} onDelete={onDelete} />;
    case "dashboard":
      return <DashboardPage />;
    case "roles":
      return <RolesPage session={session} roles={roles} onRolesChanged={onRolesChanged} />;
    case "settings":
      return <SettingsPage session={session} roles={roles} section={route.params.section} theme={theme} onThemeChange={onThemeChange} />;
    case "audit":
      return <AuditLogPage session={session} roles={roles} />;
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
            notify(t("users.deleted", { count: dialog.users.length }));
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

export function App(): JSX.Element {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [theme, setTheme] = useTheme();
  const session = useSession();
  const route = useRoute();
  const store = useMemo(() => storeFromLocation(typeof window === "undefined" ? "" : window.location.search), []);
  const [roles, setRoles] = useState<Role[]>([]);
  const { notify, toasts } = useToasts();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);

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
  useEffect(() => {
    if (session) store.listRoles().then(setRoles, () => setRoles([]));
  }, [session, store]);
  useEffect(() => {
    if (!session && route.name !== "sign-in") navigate(hrefFor.signIn());
    if (session && route.name === "sign-in") navigate(hrefFor.dashboard());
  }, [session, route.name]);

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
      <StoreContext.Provider value={store}>
        <NotifyContext.Provider value={notify}>
          {!session ? (
            <SignInPage onSignedIn={signIn} theme={theme} onThemeChange={setTheme} />
          ) : (
            <Shell route={route} session={session} roles={roles} toasts={toasts} onSignOut={signOut}>
              <Routes session={session} roles={roles} version={version} openDialog={setDialog} onRolesChanged={() => store.listRoles().then(setRoles, () => {})} theme={theme} onThemeChange={setTheme} />
              <Dialogs dialog={dialog} busy={busy} setBusy={setBusy} close={() => setDialog(null)} changed={() => setVersion((n) => n + 1)} />
            </Shell>
          )}
        </NotifyContext.Provider>
      </StoreContext.Provider>
    </I18nProvider>
  );
}
