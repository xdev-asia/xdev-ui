import { useCallback, useEffect, useState } from "react";
import type { TabStripVariant } from "@xdev-asia/ui";
import palette from "./palette.json";

/** Where the menu sits, as in react-antd-admin: a sidebar, a top bar, top bar plus sidebar, or two side columns. */
export type NavStyle = "side" | "top" | "mixed" | "two-column";
export const NAV_STYLES: readonly NavStyle[] = ["side", "top", "mixed", "two-column"];
export type TransitionName = "fade" | "fade-slide" | "fade-up" | "fade-down" | "fade-zoom";
export const TRANSITIONS: readonly TransitionName[] = ["fade", "fade-slide", "fade-up", "fade-down", "fade-zoom"];
export const TAB_STYLES: readonly TabStripVariant[] = ["chrome", "card", "plain", "brisk"];
/** Accent presets: the xDev default, Ant Design's twelve base colours plus grey, or a custom colour. */
export type Preset = "default" | "red" | "volcano" | "orange" | "gold" | "yellow" | "lime" | "green" | "cyan" | "blue" | "geekblue" | "purple" | "magenta" | "gray" | "custom";
export const PRESETS: readonly Preset[] = ["default", "red", "volcano", "orange", "gold", "yellow", "lime", "green", "cyan", "blue", "geekblue", "purple", "magenta", "gray", "custom"];
export type SideTheme = "auto" | "dark" | "light";

/** Every choice in the preferences drawer. Theme and language keep their own storage. */
export interface Prefs {
  // General
  /** Name the browser tab after the page. */
  dynamicTitle: boolean;
  /** Look for a newer build every minute and offer a reload. */
  checkUpdates: boolean;
  /** A button that scrolls a long page back up. */
  backToTop: boolean;
  watermark: boolean;
  watermarkText: string;
  // Theme
  colorWeak: boolean;
  gray: boolean;
  /** Corner radius of medium surfaces, in px; the small and large radii follow. */
  radius: number;
  preset: Preset;
  customColor: string;
  // Layout
  navStyle: NavStyle;
  crumbs: boolean;
  // Sidebar
  sidebar: boolean;
  /** Sidebar folded to a rail of icons on wide screens. */
  collapsed: boolean;
  /** Opening a menu branch closes its siblings. */
  accordion: boolean;
  sideTheme: SideTheme;
  sideWidth: number;
  railWidth: number;
  /** First column of the two-column layout. */
  columnWidth: number;
  // Tabs
  tabs: boolean;
  /** Reopen the page tabs after a reload. */
  tabsPersist: boolean;
  tabsDraggable: boolean;
  tabsIcons: boolean;
  /** The tab menu (close left, right, others, all). */
  tabsMore: boolean;
  /** The focus view button. */
  tabsMaximize: boolean;
  tabsStyle: TabStripVariant;
  // Animation
  progress: boolean;
  loading: boolean;
  transition: boolean;
  transitionName: TransitionName;
  // Footer
  footer: boolean;
  fixedFooter: boolean;
  company: string;
  companySite: string;
  copyrightYear: string;
  icp: string;
  icpLink: string;
}

export const DEFAULT_PREFS: Prefs = {
  dynamicTitle: true,
  checkUpdates: true,
  backToTop: true,
  watermark: false,
  watermarkText: "Acme console",
  colorWeak: false,
  gray: false,
  radius: 8,
  preset: "default",
  customColor: palette.presets.blue,
  navStyle: "side",
  crumbs: true,
  sidebar: true,
  collapsed: false,
  accordion: true,
  sideTheme: "auto",
  // react-antd-admin's defaults: a 210px sidebar and a footer fixed to the bottom of the window.
  sideWidth: 210,
  railWidth: 60,
  columnWidth: 80,
  tabs: true,
  tabsPersist: true,
  tabsDraggable: true,
  tabsIcons: true,
  tabsMore: true,
  tabsMaximize: true,
  tabsStyle: "chrome",
  progress: true,
  loading: true,
  transition: true,
  transitionName: "fade-slide",
  footer: true,
  fixedFooter: true,
  company: "Acme",
  companySite: "https://ui.xdev.asia/",
  copyrightYear: "2026",
  icp: "",
  icpLink: "",
};
export const PREFS_KEY = "acme-prefs";

/** Allowed ranges of the number preferences, in px. */
export const RANGES = { radius: [0, 16], sideWidth: [180, 320], railWidth: [40, 80], columnWidth: [50, 250] } as const satisfies Partial<Record<keyof Prefs, readonly [number, number]>>;
const CHOICES: Partial<Record<keyof Prefs, readonly string[]>> = { navStyle: NAV_STYLES, transitionName: TRANSITIONS, tabsStyle: TAB_STYLES, preset: PRESETS, sideTheme: ["auto", "dark", "light"] };

/** Pure: stored JSON to prefs; unknown, mistyped, out-of-range or broken values fall back to the defaults one by one. */
export function readPrefs(raw: string | null | undefined): Prefs {
  let v: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw ?? "{}");
    v = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return DEFAULT_PREFS;
  }
  const out: Record<string, unknown> = { ...DEFAULT_PREFS };
  for (const k of Object.keys(DEFAULT_PREFS) as (keyof Prefs)[]) {
    const value = v[k];
    const def = DEFAULT_PREFS[k];
    if (typeof value !== typeof def) continue;
    const choices = CHOICES[k];
    if (choices && !choices.includes(value as string)) continue;
    const range = (RANGES as Partial<Record<keyof Prefs, readonly [number, number]>>)[k];
    if (range && (typeof value !== "number" || !Number.isFinite(value) || value < range[0] || value > range[1])) continue;
    if (k === "customColor" && !/^#[0-9a-f]{6}$/i.test(value as string)) continue;
    out[k] = value;
  }
  return out as unknown as Prefs;
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
