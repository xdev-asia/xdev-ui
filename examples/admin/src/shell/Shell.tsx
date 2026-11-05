import { useState, type JSX, type ReactNode } from "react";
import { AppShell, Breadcrumb, BrandMark, NavList, SearchInput, type IconName } from "@xdev-asia/ui";
import type { Session } from "../auth/session";
import { canRead } from "../auth/permissions";
import type { Role } from "../data/seed";
import { useI18n, type MessageKey } from "../i18n";
import { hrefFor, navigate, type Route } from "../router";
import { AccountMenu } from "./AccountMenu";

interface NavEntry {
  id: string;
  label: MessageKey;
  icon: IconName;
  href: string;
  /** Route names that mark this entry as current. */
  routes: Route["name"][];
  resource?: "users" | "roles" | "audit" | "settings";
}

const GROUPS: { title: MessageKey; items: NavEntry[] }[] = [
  { title: "nav.overview", items: [{ id: "dashboard", label: "nav.dashboard", icon: "home", href: hrefFor.dashboard(), routes: ["dashboard"] }] },
  {
    title: "nav.access",
    items: [
      { id: "users", label: "nav.users", icon: "accounts", href: hrefFor.users(), routes: ["users", "user"], resource: "users" },
      { id: "roles", label: "nav.roles", icon: "shield", href: hrefFor.roles(), routes: ["roles"], resource: "roles" },
    ],
  },
  {
    title: "nav.system",
    items: [
      { id: "audit", label: "nav.audit", icon: "history", href: hrefFor.audit(), routes: ["audit"], resource: "audit" },
      { id: "settings", label: "nav.settings", icon: "settings", href: hrefFor.settings(), routes: ["settings"] },
    ],
  },
];

export interface ShellProps {
  route: Route;
  session: Session;
  roles: Role[];
  toasts?: ReactNode;
  onSignOut: () => void;
  children: ReactNode;
  /** Drawer state for tests and screenshots. */
  initialNavOpen?: boolean;
}

export function Shell({ route, session, roles, toasts, onSignOut, children, initialNavOpen = false }: ShellProps): JSX.Element {
  const { t, ui } = useI18n();
  const [navOpen, setNavOpen] = useState(initialNavOpen);
  const [query, setQuery] = useState("");
  const visible = (e: NavEntry): boolean => !e.resource || canRead(roles, session.role, e.resource);
  const current = GROUPS.flatMap((g) => g.items).find((e) => e.routes.includes(route.name));
  const crumbs = [
    ...(current ? [{ label: t(current.label), href: current.href }] : []),
    ...(route.name === "user" ? [{ label: route.params.id, mono: true }] : []),
  ];
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
      nav={GROUPS.map((g) => {
        const items = g.items.filter(visible);
        return items.length ? (
          <NavList
            key={g.title}
            title={t(g.title)}
            labels={ui.navList}
            value={current?.id}
            onSelect={() => setNavOpen(false)}
            items={items.map((e) => ({ id: e.id, label: t(e.label), icon: e.icon, href: e.href }))}
          />
        ) : null;
      })}
      crumbs={<Breadcrumb items={crumbs} labels={ui.breadcrumb} />}
      actions={
        <>
          <form
            className="app-top-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`#/users?q=${encodeURIComponent(query)}`);
            }}
          >
            <SearchInput
              size="sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery("")}
              placeholder={t("account.search")}
              aria-label={t("account.search")}
              labels={ui.searchInput}
            />
          </form>
          <AccountMenu session={session} onSettings={() => navigate(hrefFor.settings())} onSignOut={onSignOut} />
        </>
      }
    >
      {children}
    </AppShell>
  );
}
