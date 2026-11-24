import type { IconName, NavListItem } from "@xdev-asia/ui";
import { canRead } from "../auth/permissions";
import type { Resource, Role, RoleId } from "../data/seed";
import type { MessageKey } from "../i18n";
import { hrefFor, type Route } from "../router";

/**
 * One menu tree, in react-antd-admin's order: Home, Access demo, Nested menus, Outside pages, Exception pages,
 * System, Personal center, About. Leaves link to a page; branches open and close.
 */
export interface NavNode {
  id: string;
  label: MessageKey;
  icon: IconName;
  /** Leaves only. */
  href?: string;
  /** Leaves only: true when this entry is the current place for the route. */
  current?: (r: Route) => boolean;
  /** Read permission the entry needs; none means every signed-in role sees it. */
  resource?: Resource;
  /** Only these roles see it (the "visible to admins" and "visible to viewers" demo pages). */
  roles?: RoleId[];
  /** Opens another site in a new tab. */
  external?: boolean;
  children?: NavNode[];
}

const is = (...names: Route["name"][]) => (r: Route) => names.includes(r.name);
const param = (name: Route["name"], key: string, value: string) => (r: Route) => r.name === name && r.params[key] === value;

export const NAV: NavNode[] = [
  { id: "dashboard", label: "nav.dashboard", icon: "home", href: hrefFor.dashboard(), current: is("dashboard") },
  {
    id: "access",
    label: "nav.accessDemo",
    icon: "shield",
    children: [
      { id: "access-mode", label: "nav.accessMode", icon: "cloud", href: hrefFor.access("mode"), current: param("access", "page", "mode") },
      { id: "access-pages", label: "nav.pageControl", icon: "file-text", href: hrefFor.access("pages"), current: param("access", "page", "pages") },
      { id: "access-buttons", label: "nav.buttonControl", icon: "lock", href: hrefFor.access("buttons"), current: param("access", "page", "buttons") },
      { id: "access-admin", label: "nav.adminVisible", icon: "eye", href: hrefFor.access("admin"), current: param("access", "page", "admin"), roles: ["owner", "admin"] },
      { id: "access-common", label: "nav.commonVisible", icon: "eye", href: hrefFor.access("common"), current: param("access", "page", "common"), roles: ["editor", "viewer"] },
    ],
  },
  {
    id: "nested",
    label: "nav.nested",
    icon: "workflow",
    children: [
      {
        id: "menu1",
        label: "nav.menu1",
        icon: "folder",
        children: [
          { id: "menu1-1", label: "nav.menu11", icon: "file", href: hrefFor.nested("menu1-1"), current: param("nested", "leaf", "menu1-1") },
          { id: "menu1-2", label: "nav.menu12", icon: "file", href: hrefFor.nested("menu1-2"), current: param("nested", "leaf", "menu1-2") },
        ],
      },
      { id: "menu2", label: "nav.menu2", icon: "file", href: hrefFor.nested("menu2"), current: param("nested", "leaf", "menu2") },
    ],
  },
  {
    id: "outside",
    label: "nav.outside",
    icon: "globe",
    children: [
      {
        id: "embedded",
        label: "nav.embedded",
        icon: "panel-right",
        children: [
          { id: "embed-docs", label: "nav.docs", icon: "book", href: hrefFor.embed("docs"), current: param("embed", "id", "docs") },
          { id: "embed-storybook", label: "nav.storybook", icon: "layers", href: hrefFor.embed("storybook"), current: param("embed", "id", "storybook") },
        ],
      },
      {
        id: "external",
        label: "nav.externalLink",
        icon: "external",
        children: [
          { id: "react-docs", label: "nav.reactDocs", icon: "external", href: "https://react.dev/", current: () => false, external: true },
          { id: "github", label: "nav.github", icon: "external", href: "https://github.com/xdev-asia/xdev-ui", current: () => false, external: true },
        ],
      },
    ],
  },
  {
    id: "exception",
    label: "nav.statusPages",
    icon: "alert",
    children: [
      { id: "403", label: "nav.forbidden", icon: "lock", href: hrefFor.exception("403"), current: param("exception", "code", "403") },
      { id: "404", label: "nav.notFound", icon: "search", href: hrefFor.exception("404"), current: param("exception", "code", "404") },
      { id: "500", label: "nav.serverError", icon: "alert", href: hrefFor.exception("500"), current: param("exception", "code", "500") },
      { id: "unknown", label: "nav.unknownComponent", icon: "help", href: hrefFor.unknown(), current: param("exception", "code", "unknown") },
    ],
  },
  {
    id: "system",
    label: "nav.system",
    icon: "settings",
    children: [
      { id: "users", label: "nav.users", icon: "accounts", href: hrefFor.users(), current: is("users", "user"), resource: "users" },
      { id: "roles", label: "nav.roles", icon: "shield", href: hrefFor.roles(), current: is("roles"), resource: "roles" },
      { id: "menus", label: "nav.menus", icon: "list", href: hrefFor.menus(), current: is("menus"), resource: "settings" },
      { id: "departments", label: "nav.departments", icon: "layers", href: hrefFor.departments(), current: is("departments"), resource: "users" },
      { id: "audit", label: "nav.audit", icon: "history", href: hrefFor.audit(), current: is("audit"), resource: "audit" },
    ],
  },
  {
    id: "personal",
    label: "nav.personal",
    icon: "edit",
    children: [
      { id: "profile", label: "nav.profile", icon: "edit", href: hrefFor.profile(), current: is("profile") },
      { id: "settings", label: "nav.settings", icon: "sliders", href: hrefFor.settings(), current: is("settings") },
    ],
  },
  { id: "about", label: "nav.about", icon: "info", href: hrefFor.about(), current: is("about") },
];

const pathOf = (href: string | undefined): string => (href ?? "").replace(/^#/, "");

/** Pure: true when the role may see the entry; `hidden` holds paths the back-end menu switched off. */
export function allowed(n: NavNode, roles: Role[], role: RoleId, hidden?: ReadonlySet<string>): boolean {
  if (n.roles && !n.roles.includes(role)) return false;
  if (hidden?.has(pathOf(n.href))) return false;
  return !n.resource || canRead(roles, role, n.resource);
}

/** Pure: the tree a role sees; branches left empty are dropped. */
export function navFor(roles: Role[], role: RoleId, tree: NavNode[] = NAV, hidden?: ReadonlySet<string>): NavNode[] {
  return tree.flatMap((n) => {
    if (!n.children) return allowed(n, roles, role, hidden) ? [n] : [];
    const children = navFor(roles, role, n.children, hidden);
    return children.length ? [{ ...n, children }] : [];
  });
}

export interface NavLeaf {
  entry: NavNode;
  /** Branches from the root down to the entry, for the breadcrumb and the search detail. */
  trail: NavNode[];
}

/** Pure: every leaf with the branches above it, depth first. */
export function leaves(tree: NavNode[] = NAV, trail: NavNode[] = []): NavLeaf[] {
  return tree.flatMap((n) => (n.children ? leaves(n.children, [...trail, n]) : [{ entry: n, trail }]));
}

/** Pure: the leaf that marks the route as current, if any. */
export function currentOf(route: Route, tree: NavNode[] = NAV): NavLeaf | null {
  return leaves(tree).find((l) => l.entry.current?.(route)) ?? null;
}

/** Pure: true when the role may open the route; a page outside the menu (sign-in, not found) is open to all. */
export function canOpen(route: Route, roles: Role[], role: RoleId, hidden?: ReadonlySet<string>): boolean {
  const hit = currentOf(route);
  return !hit || allowed(hit.entry, roles, role, hidden);
}

/** Pure: the tree as NavList items, labels translated. */
export function toItems(tree: NavNode[], t: (key: MessageKey) => string): NavListItem[] {
  return tree.map((n) => ({ id: n.id, label: t(n.label), icon: n.icon, href: n.href, children: n.children ? toItems(n.children, t) : undefined }));
}

/**
 * Pure: which top-bar sections fit in `avail` px, in order, with room kept for a "More" button when some do not.
 * The current section stays when it can: when it would overflow, it takes the place of the last one that fits. When not
 * even it fits beside "More", only "More" shows.
 */
export function fitSections(widths: readonly number[], avail: number, more: number, gap: number, current = -1): number[] {
  const total = widths.reduce((s, w) => s + w, 0) + gap * Math.max(widths.length - 1, 0);
  if (total <= avail) return widths.map((_, i) => i);
  const room = avail - more - gap;
  const shown: number[] = [];
  let used = 0;
  for (let i = 0; i < widths.length; i++) {
    const w = (widths[i] ?? 0) + (shown.length ? gap : 0);
    if (used + w > room) break;
    used += w;
    shown.push(i);
  }
  if (current >= 0 && !shown.includes(current)) {
    // Drop from the end until the current section fits beside the rest.
    while (shown.length && used + gap + (widths[current] ?? 0) > room) {
      const out = shown.pop() as number;
      used -= (widths[out] ?? 0) + (shown.length ? gap : 0);
    }
    if ((widths[current] ?? 0) + (shown.length ? used + gap : 0) <= room) shown.push(current);
  }
  return shown;
}
