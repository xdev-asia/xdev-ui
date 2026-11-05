import { useSyncExternalStore } from "react";

export type RouteName = "home" | "settings" | "not-found";
const STATIC: Record<string, RouteName> = { "/": "home", "/settings": "settings" };

/** Pure: turns "#/settings" into a route name; unknown paths are "not-found". */
export function matchRoute(hash: string): RouteName {
  const path = "/" + hash.replace(/^#/, "").split("?")[0].replace(/^\/+|\/+$/g, "");
  return STATIC[path] ?? "not-found";
}

export const href = { home: "#/", settings: "#/settings" };

export function navigate(to: string): void {
  if (typeof window !== "undefined") window.location.hash = to.replace(/^#/, "");
}

const subscribe = (cb: () => void): (() => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

/** Current route from location.hash; "home" on the server. */
export function useRoute(): RouteName {
  return matchRoute(useSyncExternalStore(subscribe, () => window.location.hash, () => ""));
}
