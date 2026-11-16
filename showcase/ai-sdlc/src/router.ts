import { useSyncExternalStore } from "react";

export type RouteName = "workspace" | "inbox" | "history" | "runs" | "squads" | "documents" | "knowledge" | "projects" | "accounts" | "devices" | "agents" | "pipelines" | "templates" | "rules" | "settings" | "not-found";

/** Routes shown inside the settings area, in its tab order. */
export const SETTINGS_ROUTES: RouteName[] = ["projects", "accounts", "devices", "agents", "pipelines", "templates", "rules", "settings"];

// Plain names with no slash, so a link to a screen works on any static host.
const STATIC: Record<string, RouteName> = {
  "": "workspace",
  workspace: "workspace",
  inbox: "inbox",
  // The Approvals page became the inbox; old links land there.
  approvals: "inbox",
  history: "history",
  runs: "runs",
  squads: "squads",
  documents: "documents",
  knowledge: "knowledge",
  projects: "projects",
  accounts: "accounts",
  devices: "devices",
  agents: "agents",
  pipelines: "pipelines",
  templates: "templates",
  rules: "rules",
  preferences: "settings",
};

/** Pure: turns "#runs" into a route name; unknown names are "not-found". */
export function matchRoute(hash: string): RouteName {
  const name = hash.replace(/^#/, "").split("?")[0].replace(/^\/+|\/+$/g, "");
  return STATIC[name] ?? "not-found";
}

export const href = {
  workspace: "#workspace",
  inbox: "#inbox",
  history: "#history",
  runs: "#runs",
  squads: "#squads",
  documents: "#documents",
  knowledge: "#knowledge",
  projects: "#projects",
  accounts: "#accounts",
  devices: "#devices",
  agents: "#agents",
  pipelines: "#pipelines",
  templates: "#templates",
  rules: "#rules",
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
