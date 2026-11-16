import { useSyncExternalStore } from "react";

export type RouteName = "workspace" | "runs" | "documents" | "approvals" | "projects" | "accounts" | "devices" | "settings" | "not-found";

// Plain names with no slash, so a link to a screen works on any static host.
const STATIC: Record<string, RouteName> = {
  "": "workspace",
  workspace: "workspace",
  runs: "runs",
  documents: "documents",
  approvals: "approvals",
  projects: "projects",
  accounts: "accounts",
  devices: "devices",
  preferences: "settings",
};

/** Pure: turns "#runs" into a route name; unknown names are "not-found". */
export function matchRoute(hash: string): RouteName {
  const name = hash.replace(/^#/, "").split("?")[0].replace(/^\/+|\/+$/g, "");
  return STATIC[name] ?? "not-found";
}

export const href = {
  workspace: "#workspace",
  runs: "#runs",
  documents: "#documents",
  approvals: "#approvals",
  projects: "#projects",
  accounts: "#accounts",
  devices: "#devices",
  settings: "#preferences",
};

export function navigate(to: string): void {
  if (typeof window !== "undefined") window.location.hash = to.replace(/^#/, "");
}

const subscribe = (cb: () => void): (() => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

/** Current route from location.hash; "workspace" on the server. */
export function useRoute(): RouteName {
  return matchRoute(useSyncExternalStore(subscribe, () => window.location.hash, () => ""));
}
