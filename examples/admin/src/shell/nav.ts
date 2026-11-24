import type { IconName } from "@xdev-asia/ui";
import { canRead } from "../auth/permissions";
import type { Resource, Role, RoleId } from "../data/seed";
import type { MessageKey } from "../i18n";
import { hrefFor, type Route } from "../router";

export interface NavEntry {
  id: string;
  label: MessageKey;
  icon: IconName;
  href: string;
  /** True when this entry is the current place for the route. */
  current: (r: Route) => boolean;
  /** Read permission the entry needs; none means every signed-in role sees it. */
  resource?: Resource;
  /** Opens another site in a new tab. */
  external?: boolean;
}

export interface NavGroup {
  id: string;
  title: MessageKey;
  items: NavEntry[];
  /** Secondary group: its title opens and closes it. Closed until it holds the current page. */
  collapsible?: boolean;
}

const is = (...names: Route["name"][]) => (r: Route) => names.includes(r.name);
const param = (name: Route["name"], key: string, value: string) => (r: Route) => r.name === name && r.params[key] === value;

export const NAV: NavGroup[] = [
  { id: "overview", title: "nav.overview", items: [{ id: "dashboard", label: "nav.dashboard", icon: "home", href: hrefFor.dashboard(), current: is("dashboard") }] },
  {
    id: "access",
    title: "nav.access",
    items: [
      { id: "users", label: "nav.users", icon: "accounts", href: hrefFor.users(), current: is("users", "user"), resource: "users" },
      { id: "roles", label: "nav.roles", icon: "shield", href: hrefFor.roles(), current: is("roles"), resource: "roles" },
      { id: "permissions", label: "nav.permissions", icon: "key", href: hrefFor.permissions(), current: is("permissions") },
    ],
  },
  {
    id: "system",
    title: "nav.system",
    items: [
      { id: "menus", label: "nav.menus", icon: "list", href: hrefFor.menus(), current: is("menus"), resource: "settings" },
      { id: "departments", label: "nav.departments", icon: "layers", href: hrefFor.departments(), current: is("departments"), resource: "users" },
      { id: "audit", label: "nav.audit", icon: "history", href: hrefFor.audit(), current: is("audit"), resource: "audit" },
      { id: "settings", label: "nav.settings", icon: "settings", href: hrefFor.settings(), current: is("settings") },
    ],
  },
  {
    id: "account",
    title: "nav.account",
    items: [
      { id: "profile", label: "nav.profile", icon: "edit", href: hrefFor.profile(), current: is("profile") },
      { id: "about", label: "nav.about", icon: "info", href: hrefFor.about(), current: is("about") },
    ],
  },
  {
    id: "demos",
    title: "nav.demos",
    collapsible: true,
    items: [
      { id: "403", label: "nav.forbidden", icon: "lock", href: hrefFor.exception("403"), current: param("exception", "code", "403") },
      { id: "404", label: "nav.notFound", icon: "search", href: hrefFor.exception("404"), current: param("exception", "code", "404") },
      { id: "500", label: "nav.serverError", icon: "alert", href: hrefFor.exception("500"), current: param("exception", "code", "500") },
      { id: "docs", label: "nav.docs", icon: "book", href: hrefFor.docs(), current: is("docs") },
      { id: "github", label: "nav.github", icon: "external", href: "https://github.com/xdev-asia/xdev-ui", current: () => false, external: true },
    ],
  },
  {
    id: "nested",
    title: "nav.nested",
    collapsible: true,
    items: [
      { id: "menu1-1", label: "nav.menu11", icon: "file", href: hrefFor.nested("menu1-1"), current: param("nested", "leaf", "menu1-1") },
      { id: "menu1-2", label: "nav.menu12", icon: "file", href: hrefFor.nested("menu1-2"), current: param("nested", "leaf", "menu1-2") },
      { id: "menu2", label: "nav.menu2", icon: "file", href: hrefFor.nested("menu2"), current: param("nested", "leaf", "menu2") },
    ],
  },
];

/** Pure: the groups and entries a role sees; groups left empty are dropped. */
export function navFor(roles: Role[], role: RoleId, groups: NavGroup[] = NAV): NavGroup[] {
  return groups
    .map((g) => ({ ...g, items: g.items.filter((e) => !e.resource || canRead(roles, role, e.resource)) }))
    .filter((g) => g.items.length > 0);
}

/** Pure: the group and entry that mark the route as current, if any. */
export function currentOf(route: Route, groups: NavGroup[] = NAV): { group: NavGroup; entry: NavEntry } | null {
  for (const group of groups) {
    const entry = group.items.find((e) => e.current(route));
    if (entry) return { group, entry };
  }
  return null;
}

/** Pure: true when the role may open the route; a page outside every group (sign-in, not found) is open to all. */
export function canOpen(route: Route, roles: Role[], role: RoleId): boolean {
  const hit = currentOf(route);
  return !hit?.entry.resource || canRead(roles, role, hit.entry.resource);
}
