import { useSyncExternalStore } from "react";

export type RouteName = "dashboard" | "items" | "item" | "settings" | "sign-in" | "not-found";
export interface Route {
  name: RouteName;
  params: Record<string, string>;
}

const STATIC: Record<string, RouteName> = { "/": "dashboard", "/items": "items", "/settings": "settings", "/sign-in": "sign-in" };

const decode = (s: string): string | null => {
  try {
    return decodeURIComponent(s);
  } catch {
    return null; // malformed escape such as %E0
  }
};

/** Pure: turns "#/items/i3?x=1" into a route. */
export function matchRoute(hash: string): Route {
  const path = "/" + hash.replace(/^#/, "").split("?")[0].replace(/^\/+|\/+$/g, "");
  const name = STATIC[path];
  if (name) return { name, params: {} };
  const item = /^\/items\/([^/]+)$/.exec(path);
  const id = item ? decode(item[1]) : null;
  return id !== null ? { name: "item", params: { id } } : { name: "not-found", params: {} };
}

export const href = {
  dashboard: "#/",
  items: "#/items",
  item: (id: string) => `#/items/${encodeURIComponent(id)}`,
  settings: "#/settings",
  signIn: "#/sign-in",
};

export function navigate(to: string): void {
  if (typeof window !== "undefined") window.location.hash = to.replace(/^#/, "");
}

const subscribe = (cb: () => void): (() => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

/** Current route from location.hash; the dashboard on the server. */
export function useRoute(): Route {
  return matchRoute(useSyncExternalStore(subscribe, () => window.location.hash, () => ""));
}
