import { useState, type JSX, type ReactNode } from "react";
import { AppShell, Breadcrumb, BrandMark, NavList, type IconName } from "@xdev-asia/ui";
import type { Session } from "../auth/session";
import { useI18n, type MessageKey } from "../i18n";
import { href, navigate, type Route, type RouteName } from "../router";
import { AccountMenu } from "./AccountMenu";

interface NavEntry {
  id: string;
  label: MessageKey;
  icon: IconName;
  href: string;
  routes: RouteName[];
}

const GROUPS: { title: MessageKey; items: NavEntry[] }[] = [
  { title: "nav.overview", items: [{ id: "dashboard", label: "nav.dashboard", icon: "home", href: href.dashboard, routes: ["dashboard"] }] },
  {
    title: "nav.manage",
    items: [
      { id: "items", label: "nav.items", icon: "accounts", href: href.items, routes: ["items", "item"] },
      { id: "settings", label: "nav.settings", icon: "settings", href: href.settings, routes: ["settings"] },
    ],
  },
];

export function Shell({ route, session, toasts, onSignOut, children }: { route: Route; session: Session; toasts?: ReactNode; onSignOut: () => void; children: ReactNode }): JSX.Element {
  const { t, ui } = useI18n();
  const [navOpen, setNavOpen] = useState(false);
  const current = GROUPS.flatMap((g) => g.items).find((e) => e.routes.includes(route.name));
  const crumbs = [...(current ? [{ label: t(current.label), href: current.href }] : []), ...(route.name === "item" ? [{ label: route.params.id, mono: true }] : [])];
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
      nav={GROUPS.map((g) => (
        <NavList key={g.title} title={t(g.title)} labels={ui.navList} value={current?.id} onSelect={() => setNavOpen(false)} items={g.items.map((e) => ({ id: e.id, label: t(e.label), icon: e.icon, href: e.href }))} />
      ))}
      crumbs={<Breadcrumb items={crumbs} labels={ui.breadcrumb} />}
      actions={<AccountMenu session={session} onSettings={() => navigate(href.settings)} onSignOut={onSignOut} />}
    >
      {children}
    </AppShell>
  );
}
