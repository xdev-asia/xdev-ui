import { useSyncExternalStore } from "react";

export type RouteName =
  | "dashboard"
  | "users"
  | "user"
  | "roles"
  | "access"
  | "embed"
  | "legal"
  | "menus"
  | "departments"
  | "settings"
  | "audit"
  | "profile"
  | "about"
  | "exception"
  | "nested"
  | "sign-in"
  | "not-found";

/** Status pages the console can show; 404 is also what an unknown path renders. */
export const EXCEPTIONS = ["403", "404", "500"] as const;
export type ExceptionCode = (typeof EXCEPTIONS)[number];
/** Leaves of the nested-menu demo. */
export const NESTED = ["menu1-1", "menu1-2", "menu2"] as const;
/** The access demo pages, as in react-antd-admin's "Access" menu. */
export const ACCESS_PAGES = ["mode", "pages", "buttons", "admin", "common"] as const;
export type AccessPage = (typeof ACCESS_PAGES)[number];
/** Sites shown inside the console (Outside pages, Embedded). */
export const EMBEDS = { docs: "https://ui.xdev.asia/", storybook: "https://ui.xdev.asia/storybook/" } as const;
export type EmbedId = keyof typeof EMBEDS;
/** Public pages, open without signing in. */
export const LEGAL = ["privacy", "terms"] as const;
export type LegalPage = (typeof LEGAL)[number];
export interface Route {
  name: RouteName;
  params: Record<string, string>;
  path: string;
}

const STATIC: Record<string, RouteName> = {
  "/": "dashboard",
  "/users": "users",
  "/roles": "roles",
  "/settings": "settings",
  "/audit": "audit",
  "/menus": "menus",
  "/departments": "departments",
  "/profile": "profile",
  "/about": "about",
  "/sign-in": "sign-in",
};

const decode = (s: string): string | null => {
  try {
    return decodeURIComponent(s);
  } catch {
    return null; // malformed escape such as %E0
  }
};

/** Pure: turns a path such as "/users/u12?tab=activity" into a route. */
export function matchRoute(input: string): Route {
  const path = ("/" + input.replace(/^#/, "").split("?")[0]!.replace(/^\/+|\/+$/g, "")).replace(/\/$/, "") || "/";
  const name = STATIC[path];
  if (name) return { name, params: {}, path };
  const user = /^\/users\/([^/]+)$/.exec(path)?.[1];
  const userId = user !== undefined ? decode(user) : null;
  if (userId !== null) return { name: "user", params: { id: userId }, path };
  const section = /^\/settings\/([^/]+)$/.exec(path)?.[1];
  const sectionId = section !== undefined ? decode(section) : null;
  if (sectionId !== null) return { name: "settings", params: { section: sectionId }, path };
  const code = /^\/exception\/(\d{3})$/.exec(path)?.[1];
  if (code !== undefined && (EXCEPTIONS as readonly string[]).includes(code)) return { name: "exception", params: { code }, path };
  if (path === "/exception/unknown") return { name: "exception", params: { code: "unknown" }, path };
  const access = /^\/access\/([\w-]+)$/.exec(path)?.[1];
  if (access !== undefined && (ACCESS_PAGES as readonly string[]).includes(access)) return { name: "access", params: { page: access }, path };
  const embed = /^\/outside\/([\w-]+)$/.exec(path)?.[1];
  if (embed !== undefined && embed in EMBEDS) return { name: "embed", params: { id: embed }, path };
  const legal = /^\/(privacy|terms)$/.exec(path)?.[1];
  if (legal !== undefined) return { name: "legal", params: { page: legal }, path };
  const leaf = /^\/nested\/([\w-]+)$/.exec(path)?.[1];
  if (leaf !== undefined && (NESTED as readonly string[]).includes(leaf)) return { name: "nested", params: { leaf }, path };
  return { name: "not-found", params: {}, path };
}

export const hrefFor = {
  dashboard: () => "#/",
  users: () => "#/users",
  user: (id: string) => `#/users/${encodeURIComponent(id)}`,
  roles: () => "#/roles",
  audit: () => "#/audit",
  access: (page: AccessPage) => `#/access/${page}`,
  embed: (id: EmbedId) => `#/outside/${id}`,
  legal: (page: LegalPage) => `#/${page}`,
  unknown: () => "#/exception/unknown",
  menus: () => "#/menus",
  departments: () => "#/departments",
  profile: () => "#/profile",
  about: () => "#/about",
  exception: (code: ExceptionCode) => `#/exception/${code}`,
  nested: (leaf: (typeof NESTED)[number]) => `#/nested/${leaf}`,
  settings: (section?: string) => (section ? `#/settings/${section}` : "#/settings"),
  signIn: () => "#/sign-in",
};

/** Query parameters of a hash such as "#/users?q=ada". */
export function queryOf(hash: string): URLSearchParams {
  return new URLSearchParams(hash.split("?")[1] ?? "");
}

/**
 * Writes view state (a filter, a period, a previewed role) into the query of the current hash without a new history
 * entry, so reload and a shared link keep it. Empty values are dropped.
 */
export function replaceQuery(patch: Record<string, string | null | undefined>): void {
  if (typeof window === "undefined") return;
  const [path, query = ""] = window.location.hash.replace(/^#/, "").split("?");
  const params = new URLSearchParams(query);
  for (const [k, v] of Object.entries(patch)) {
    if (v) params.set(k, v);
    else params.delete(k);
  }
  const q = params.toString();
  window.history.replaceState(window.history.state, "", `#${path || "/"}${q ? `?${q}` : ""}`);
}

/** One query parameter of the current hash, read once (pages pass it as the view's starting state). */
export function initialParam(key: string): string | null {
  return typeof window === "undefined" ? null : queryOf(window.location.hash).get(key);
}

export function navigate(href: string): void {
  if (typeof window !== "undefined") window.location.hash = href.replace(/^#/, "");
}

const subscribe = (cb: () => void): (() => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

/** Current route from location.hash; "/" on the server. */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => "");
  return matchRoute(hash);
}
