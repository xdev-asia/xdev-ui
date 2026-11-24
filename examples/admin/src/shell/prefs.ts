import { useCallback, useEffect, useState } from "react";

/** Layout choices from the preferences drawer. Theme and language keep their own storage. */
export interface Prefs {
  tabs: boolean;
  crumbs: boolean;
  footer: boolean;
  /** Sidebar folded to a rail of icons on wide screens. */
  collapsed: boolean;
  /** Name the browser tab after the page. */
  dynamicTitle: boolean;
  /** A button that scrolls a long page back up. */
  backToTop: boolean;
  /** Reopen the page tabs after a reload. */
  tabsPersist: boolean;
  /** Reload, focus view and the tab menu after the tabs. */
  tabsTools: boolean;
}

export const DEFAULT_PREFS: Prefs = { tabs: true, crumbs: true, footer: true, collapsed: false, dynamicTitle: true, backToTop: true, tabsPersist: true, tabsTools: true };
export const PREFS_KEY = "acme-prefs";

/** Pure: stored JSON to prefs; unknown or broken values fall back to the defaults one by one. */
export function readPrefs(raw: string | null | undefined): Prefs {
  try {
    const v = JSON.parse(raw ?? "{}") as Partial<Record<keyof Prefs, unknown>>;
    const pick = (k: keyof Prefs): boolean => (typeof v[k] === "boolean" ? (v[k] as boolean) : DEFAULT_PREFS[k]);
    return Object.fromEntries((Object.keys(DEFAULT_PREFS) as (keyof Prefs)[]).map((k) => [k, pick(k)])) as unknown as Prefs;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function usePrefs(): [Prefs, (next: Prefs) => void] {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  useEffect(() => {
    try {
      setPrefs(readPrefs(window.localStorage.getItem(PREFS_KEY)));
    } catch {
      /* storage blocked: keep the defaults */
    }
  }, []);
  const set = useCallback((next: Prefs) => {
    setPrefs(next);
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      /* private mode: the choice lasts for this visit */
    }
  }, []);
  return [prefs, set];
}

export interface OpenPage {
  path: string;
  title: string;
}

/** The home page's tab: always first, never closed. */
export const HOME = "/";

/** Pure: the page tabs after visiting `page`: home first, then the others in visit order, each once, at most `max`. */
export function visitTab(tabs: readonly OpenPage[], page: OpenPage, max = 10): OpenPage[] {
  const at = tabs.findIndex((t) => t.path === page.path);
  let next = at >= 0 ? tabs.map((t, i) => (i === at ? page : t)) : [...tabs, page];
  const home = next.find((t) => t.path === HOME);
  if (home) next = [home, ...next.filter((t) => t !== home)];
  // Over the limit: drop the oldest tabs, never home and never the page just visited.
  while (next.length > max) {
    const i = next.findIndex((t) => t.path !== HOME && t.path !== page.path);
    if (i < 0) break;
    next.splice(i, 1);
  }
  return next;
}

export type TabAction = "close" | "others" | "left" | "right" | "all";

/** Pure: the tabs after a close action on `target`, and where to go when the current page closed (its right neighbour, else its left, else home). Home stays. */
export function closeTabs(tabs: readonly OpenPage[], action: TabAction, target: string, current: string): { tabs: OpenPage[]; go: string | null } {
  const at = tabs.findIndex((t) => t.path === target);
  if (at < 0) return { tabs: [...tabs], go: null };
  const drop = (t: OpenPage, i: number): boolean => {
    if (t.path === HOME) return false;
    if (action === "close") return i === at;
    if (action === "others") return i !== at;
    if (action === "left") return i < at;
    if (action === "right") return i > at;
    return true;
  };
  const next = tabs.filter((t, i) => !drop(t, i));
  if (next.some((t) => t.path === current)) return { tabs: next, go: null };
  const cur = tabs.findIndex((t) => t.path === current);
  const right = tabs.slice(cur + 1).find((t) => next.includes(t));
  const left = [...tabs.slice(0, Math.max(cur, 0))].reverse().find((t) => next.includes(t));
  return { tabs: next, go: (right ?? left)?.path ?? HOME };
}

/** Pure: stored tabs back to a list; anything malformed is dropped. */
export function readTabs(raw: string | null | undefined): OpenPage[] {
  try {
    const v = JSON.parse(raw ?? "[]") as unknown;
    return Array.isArray(v) ? v.filter((x): x is OpenPage => !!x && typeof x.path === "string" && typeof x.title === "string") : [];
  } catch {
    return [];
  }
}
