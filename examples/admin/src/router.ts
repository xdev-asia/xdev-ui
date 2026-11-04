import { useSyncExternalStore } from "react";

export type RouteName = "dashboard" | "users" | "user" | "roles" | "settings" | "audit" | "sign-in" | "not-found";
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
  "/sign-in": "sign-in",
};

/** Pure: turns a path such as "/users/u12?tab=activity" into a route. */
export function matchRoute(input: string): Route {
  const path = ("/" + input.replace(/^#/, "").split("?")[0].replace(/^\/+|\/+$/g, "")).replace(/\/$/, "") || "/";
  const name = STATIC[path];
  if (name) return { name, params: {}, path };
  const user = /^\/users\/([^/]+)$/.exec(path);
  if (user) return { name: "user", params: { id: decodeURIComponent(user[1]) }, path };
  const section = /^\/settings\/([^/]+)$/.exec(path);
  if (section) return { name: "settings", params: { section: decodeURIComponent(section[1]) }, path };
  return { name: "not-found", params: {}, path };
}

export const hrefFor = {
  dashboard: () => "#/",
  users: () => "#/users",
  user: (id: string) => `#/users/${encodeURIComponent(id)}`,
  roles: () => "#/roles",
  audit: () => "#/audit",
  settings: (section?: string) => (section ? `#/settings/${section}` : "#/settings"),
  signIn: () => "#/sign-in",
};

/** Query parameters of a hash such as "#/users?q=ada". */
export function queryOf(hash: string): URLSearchParams {
  return new URLSearchParams(hash.split("?")[1] ?? "");
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
