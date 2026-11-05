import { useCallback, useEffect, useState, type JSX } from "react";
import { AppShell, Breadcrumb, BrandMark, NavList } from "@xdev-asia/ui";
import { I18nProvider, readLocale, useI18n, type Locale } from "./i18n";
import { NotifyContext, useToasts } from "./notify";
import { HomePage } from "./pages/Home";
import { NotFoundPage } from "./pages/NotFound";
import { SettingsPage } from "./pages/Settings";
import { href, useRoute } from "./router";
import { useTheme } from "./theme";

const LOCALE_KEY = "app-locale";

function Shell({ toasts }: { toasts: React.ReactNode }): JSX.Element {
  const { t, ui } = useI18n();
  const route = useRoute();
  const [theme, setTheme] = useTheme();
  const [navOpen, setNavOpen] = useState(false);
  const items = [
    { id: "home", label: t("nav.home"), icon: "home" as const, href: href.home },
    { id: "settings", label: t("nav.settings"), icon: "settings" as const, href: href.settings },
  ];
  const current = items.find((i) => i.id === route);
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
      nav={<NavList title={t("nav.main")} labels={ui.navList} value={current?.id} onSelect={() => setNavOpen(false)} items={items} />}
      crumbs={<Breadcrumb items={current ? [{ label: current.label, href: current.href }] : []} labels={ui.breadcrumb} />}
    >
      {route === "home" ? <HomePage /> : route === "settings" ? <SettingsPage theme={theme} onThemeChange={setTheme} /> : <NotFoundPage />}
    </AppShell>
  );
}

function Toasted(): JSX.Element {
  const { notify, toasts } = useToasts();
  return (
    <NotifyContext.Provider value={notify}>
      <Shell toasts={toasts} />
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
