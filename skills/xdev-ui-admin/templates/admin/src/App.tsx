import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { signIn, signOut, useSession, type Session } from "./auth/session";
import { StoreContext } from "./data/context";
import { storeFromLocation } from "./data/store";
import { I18nProvider, readLocale, type Locale } from "./i18n";
import { NotifyContext, useToasts } from "./notify";
import { DashboardPage } from "./pages/Dashboard";
import { ItemDetailPage } from "./pages/ItemDetail";
import { ItemsPage } from "./pages/ItemsList";
import { NotFoundPage } from "./pages/NotFound";
import { SettingsPage } from "./pages/Settings";
import { SignInPage } from "./pages/SignIn";
import { href, navigate, useRoute } from "./router";
import { Shell } from "./shell/Shell";
import { useTheme } from "./theme";

const LOCALE_KEY = "admin-locale";

function Signed({ session, theme, onThemeChange }: { session: Session; theme: ReturnType<typeof useTheme>[0]; onThemeChange: ReturnType<typeof useTheme>[1] }): JSX.Element {
  const route = useRoute();
  const { notify, toasts } = useToasts();
  return (
    <NotifyContext.Provider value={notify}>
      <Shell route={route} session={session} toasts={toasts} onSignOut={signOut}>
        {route.name === "dashboard" ? <DashboardPage /> : route.name === "items" ? <ItemsPage session={session} /> : route.name === "item" ? <ItemDetailPage key={route.params.id} id={route.params.id} session={session} /> : route.name === "settings" ? <SettingsPage theme={theme} onThemeChange={onThemeChange} /> : <NotFoundPage />}
      </Shell>
    </NotifyContext.Provider>
  );
}

export function App(): JSX.Element {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [theme, setTheme] = useTheme();
  const session = useSession();
  const route = useRoute();
  const store = useMemo(() => storeFromLocation(typeof window === "undefined" ? "" : window.location.search), []);
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
    if (!session && route.name !== "sign-in") navigate(href.signIn);
    if (session && route.name === "sign-in") navigate(href.dashboard);
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
        {session ? <Signed session={session} theme={theme} onThemeChange={setTheme} /> : <SignInPage onSignedIn={signIn} theme={theme} onThemeChange={setTheme} />}
      </StoreContext.Provider>
    </I18nProvider>
  );
}
