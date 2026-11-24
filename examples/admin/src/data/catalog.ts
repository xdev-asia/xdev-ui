import { DEMO_NOW } from "./seed";

/** A node of a tree the console lists as rows: menus, departments. */
export interface TreeNode<T> {
  id: string;
  data: T;
  children?: TreeNode<T>[];
}

/** One visible row of a tree list: the node, its depth (0 at the root) and whether it can open. */
export interface TreeRow<T> {
  id: string;
  data: T;
  depth: number;
  parent: string | null;
  hasChildren: boolean;
  expanded: boolean;
}

/** Pure: the rows a tree list shows, depth first, skipping the children of closed nodes. */
export function visibleRows<T>(tree: readonly TreeNode<T>[], expanded: ReadonlySet<string>, depth = 0, parent: string | null = null): TreeRow<T>[] {
  return tree.flatMap((n) => {
    const hasChildren = !!n.children?.length;
    const open = hasChildren && expanded.has(n.id);
    const row: TreeRow<T> = { id: n.id, data: n.data, depth, parent, hasChildren, expanded: open };
    return open ? [row, ...visibleRows(n.children!, expanded, depth + 1, n.id)] : [row];
  });
}

/** Pure: ids of every node that has children, to open the whole tree. */
export function branchIds<T>(tree: readonly TreeNode<T>[]): string[] {
  return tree.flatMap((n) => (n.children?.length ? [n.id, ...branchIds(n.children)] : []));
}

/** Pure: the nodes whose data matches, with their ancestors kept so each match keeps its place. */
export function filterTree<T>(tree: readonly TreeNode<T>[], match: (data: T) => boolean): TreeNode<T>[] {
  return tree.flatMap((n) => {
    const kids = n.children ? filterTree(n.children, match) : [];
    if (match(n.data) || kids.length) return [{ ...n, children: kids.length ? kids : n.children && match(n.data) ? n.children : undefined }];
    return [];
  });
}

export type MenuKind = "group" | "page" | "link" | "action";
export interface MenuItem {
  name: string;
  kind: MenuKind;
  path: string;
  order: number;
  enabled: boolean;
  /** Permission code that shows the item, e.g. "users.read". */
  code: string;
}

const menu = (id: string, data: MenuItem, children?: TreeNode<MenuItem>[]): TreeNode<MenuItem> => ({ id, data, children });

/** The console's own menu, as an admin would manage it. Names are proper nouns of the demo, not UI strings. */
export function seedMenus(): TreeNode<MenuItem>[] {
  return [
    menu("m-dashboard", { name: "Dashboard", kind: "page", path: "/", order: 1, enabled: true, code: "dashboard.read" }),
    menu("m-access", { name: "Access", kind: "group", path: "/access", order: 2, enabled: true, code: "" }, [
      menu("m-users", { name: "Users", kind: "page", path: "/users", order: 1, enabled: true, code: "users.read" }, [
        menu("m-users-create", { name: "Create user", kind: "action", path: "", order: 1, enabled: true, code: "users.create" }),
        menu("m-users-delete", { name: "Delete user", kind: "action", path: "", order: 2, enabled: true, code: "users.delete" }),
      ]),
      menu("m-roles", { name: "Roles", kind: "page", path: "/roles", order: 2, enabled: true, code: "roles.read" }),
      menu("m-permissions", { name: "Permissions", kind: "page", path: "/permissions", order: 3, enabled: true, code: "" }),
    ]),
    menu("m-system", { name: "System", kind: "group", path: "/system", order: 3, enabled: true, code: "" }, [
      menu("m-menus", { name: "Menus", kind: "page", path: "/menus", order: 1, enabled: true, code: "settings.read" }),
      menu("m-departments", { name: "Departments", kind: "page", path: "/departments", order: 2, enabled: true, code: "users.read" }),
      menu("m-audit", { name: "Audit log", kind: "page", path: "/audit", order: 3, enabled: true, code: "audit.read" }),
      menu("m-settings", { name: "Settings", kind: "page", path: "/settings", order: 4, enabled: true, code: "" }),
    ]),
    menu("m-demos", { name: "Demos", kind: "group", path: "/demos", order: 4, enabled: true, code: "" }, [
      menu("m-nested", { name: "Nested menu", kind: "group", path: "/nested", order: 1, enabled: true, code: "" }, [
        menu("m-nested-1-1", { name: "Menu 1-1", kind: "page", path: "/nested/menu1-1", order: 1, enabled: true, code: "" }),
        menu("m-nested-1-2", { name: "Menu 1-2", kind: "page", path: "/nested/menu1-2", order: 2, enabled: true, code: "" }),
        menu("m-nested-2", { name: "Menu 2", kind: "page", path: "/nested/menu2", order: 3, enabled: false, code: "" }),
      ]),
      menu("m-docs", { name: "Embedded docs", kind: "page", path: "/docs", order: 2, enabled: true, code: "" }),
      menu("m-github", { name: "Source on GitHub", kind: "link", path: "https://github.com/xdev-asia/xdev-ui", order: 3, enabled: true, code: "" }),
    ]),
  ];
}

export interface Department {
  name: string;
  lead: string;
  members: number;
  enabled: boolean;
}

const dept = (id: string, data: Department, children?: TreeNode<Department>[]): TreeNode<Department> => ({ id, data, children });

export function seedDepartments(): TreeNode<Department>[] {
  return [
    dept("d-hq", { name: "Acme head office", lead: "Ada Lovelace", members: 57, enabled: true }, [
      dept("d-eng", { name: "Engineering", lead: "Linus Torvalds", members: 24, enabled: true }, [
        dept("d-platform", { name: "Platform", lead: "Radia Perlman", members: 9, enabled: true }),
        dept("d-apps", { name: "Applications", lead: "Brendan Eich", members: 11, enabled: true }),
        dept("d-qa", { name: "Quality", lead: "Margaret Hamilton", members: 4, enabled: true }),
      ]),
      dept("d-product", { name: "Product", lead: "Grace Hopper", members: 8, enabled: true }),
      dept("d-ops", { name: "Operations", lead: "Tim Berners-Lee", members: 14, enabled: true }, [
        dept("d-support", { name: "Support", lead: "Trang Phạm", members: 10, enabled: true }),
        dept("d-finance", { name: "Finance", lead: "Hùng Lê", members: 4, enabled: false }),
      ]),
    ]),
  ];
}

export type NoticeKind = "security" | "user" | "system";
export interface Notice {
  id: string;
  kind: NoticeKind;
  /** Message key under `notices.items`, so the text is translated. */
  key: "failedSignIns" | "invited" | "storage" | "roleChanged";
  time: string;
  read: boolean;
}

const HOUR = 3_600_000;
export function seedNotices(): Notice[] {
  return [
    { id: "n1", kind: "security", key: "failedSignIns", time: new Date(DEMO_NOW - 0.5 * HOUR).toISOString(), read: false },
    { id: "n2", kind: "user", key: "invited", time: new Date(DEMO_NOW - 3 * HOUR).toISOString(), read: false },
    { id: "n3", kind: "system", key: "storage", time: new Date(DEMO_NOW - 26 * HOUR).toISOString(), read: false },
    { id: "n4", kind: "user", key: "roleChanged", time: new Date(DEMO_NOW - 50 * HOUR).toISOString(), read: true },
  ];
}

export type Period = "week" | "month" | "year";

/** Deterministic visits per bucket for the dashboard trend: 7 days, 30 days or 12 months. */
export function visitSeries(period: Period): { at: number; value: number }[] {
  const count = period === "week" ? 7 : period === "month" ? 30 : 12;
  const step = period === "year" ? 30 * 24 * HOUR : 24 * HOUR;
  const base = period === "year" ? 42_000 : 1_400;
  return Array.from({ length: count }, (_, i) => {
    const wave = Math.sin((i / count) * Math.PI * 2) * 0.18 + Math.cos(i * 1.7) * 0.07;
    const trend = 1 + (i / count) * 0.25;
    return { at: DEMO_NOW - (count - 1 - i) * step, value: Math.round(base * trend * (1 + wave)) };
  });
}

export type Channel = "all" | "online" | "store";
export type Category = "software" | "hardware" | "services" | "training" | "support";

/** Revenue share by category for one sales channel, largest first. */
export function categoryShare(channel: Channel): { category: Category; value: number }[] {
  const table: Record<Channel, Record<Category, number>> = {
    all: { software: 41, hardware: 23, services: 18, training: 11, support: 7 },
    online: { software: 55, hardware: 9, services: 16, training: 14, support: 6 },
    store: { software: 18, hardware: 46, services: 21, training: 6, support: 9 },
  };
  return (Object.entries(table[channel]) as [Category, number][]).map(([category, value]) => ({ category, value })).sort((a, b) => b.value - a.value);
}

export type Source = "direct" | "search" | "email" | "partners";
export function visitsBySource(): { source: Source; value: number }[] {
  return [
    { source: "direct", value: 3350 },
    { source: "search", value: 3100 },
    { source: "email", value: 2340 },
    { source: "partners", value: 1350 },
  ];
}

/** Pure: the tree with one node's data replaced. */
export function updateNode<T>(tree: readonly TreeNode<T>[], id: string, data: T): TreeNode<T>[] {
  return tree.map((n) => (n.id === id ? { ...n, data } : n.children ? { ...n, children: updateNode(n.children, id, data) } : n));
}

/** Pure: number of nodes in the tree. */
export function countNodes<T>(tree: readonly TreeNode<T>[]): number {
  return tree.reduce((n, x) => n + 1 + (x.children ? countNodes(x.children) : 0), 0);
}

/** Pure: the paths of menu items switched off, with everything under them; the back-end access mode hides these pages. */
export function disabledPaths(tree: readonly TreeNode<MenuItem>[], off = false): Set<string> {
  const out = new Set<string>();
  for (const n of tree) {
    const hidden = off || !n.data.enabled;
    if (hidden && n.data.path.startsWith("/")) out.add(n.data.path);
    if (n.children) for (const p of disabledPaths(n.children, hidden)) out.add(p);
  }
  return out;
}

/** Pure: the tree with a new node added at the root, last. */
export function addNode<T>(tree: readonly TreeNode<T>[], node: TreeNode<T>): TreeNode<T>[] {
  return [...tree, node];
}
