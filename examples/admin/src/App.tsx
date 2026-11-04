import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { signIn, signOut, useSession } from "./auth/session";
import type { Role } from "./data/seed";
import { StoreContext } from "./data/context";
import { storeFromLocation } from "./data/store";
import { I18nProvider, readLocale, type Locale } from "./i18n";
import { hrefFor, navigate, useRoute } from "./router";
import { Shell } from "./shell/Shell";
import { NotifyContext, useToasts } from "./shell/notify";
import { useTheme } from "./theme";
import { NotFoundPage } from "./pages/NotFound";
import { SignInPage } from "./pages/SignIn";

const LOCALE_KEY = "acme-locale";

function Routes(): JSX.Element {
  const route = useRoute();
  switch (route.name) {
    default:
      return <NotFoundPage />;
  }
}

export function App(): JSX.Element {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [theme, setTheme] = useTheme();
  const session = useSession();
  const route = useRoute();
  const store = useMemo(() => storeFromLocation(typeof window === "undefined" ? "" : window.location.search), []);
  const [roles, setRoles] = useState<Role[]>([]);
  const { notify, toasts } = useToasts();

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
              <Routes />
            </Shell>
          )}
        </NotifyContext.Provider>
      </StoreContext.Provider>
    </I18nProvider>
  );
}
