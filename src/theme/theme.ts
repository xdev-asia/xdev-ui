/** What the user picks. `system` follows the operating system. */
export type ThemePreference = "system" | "dark" | "light";
/** What is painted. */
export type ResolvedTheme = "dark" | "light";

export const THEME_PREFERENCES: readonly ThemePreference[] = ["system", "dark", "light"];

/** The media query that is true when the system is dark. */
export const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";

/** Anything with `setAttribute`, such as an HTMLElement. */
export interface ThemeRoot {
  setAttribute(name: string, value: string): void;
}

/** The part of MediaQueryList that `watchSystemTheme` uses. */
export interface MediaQueryLike {
  matches: boolean;
  addEventListener(type: "change", listener: (e: { matches: boolean }) => void): void;
  removeEventListener(type: "change", listener: (e: { matches: boolean }) => void): void;
}

export type MatchMediaLike = (query: string) => MediaQueryLike;

/** The part of MutationObserver that `onThemeChange` uses. */
export interface ObserverLike {
  observe(target: any, options: { attributes: boolean; attributeFilter: string[] }): void;
  disconnect(): void;
}

export type ObserverFactory = (callback: () => void) => ObserverLike;

/** Turns a preference into the theme to paint. Unknown values read as `system`. */
export function resolveTheme(pref: ThemePreference, prefersDark: boolean): ResolvedTheme {
  if (pref === "dark" || pref === "light") return pref;
  return prefersDark ? "dark" : "light";
}

/** Sets `data-theme` on the root (normally `document.documentElement`). */
export function applyTheme(root: ThemeRoot, resolved: ResolvedTheme): void {
  root.setAttribute("data-theme", resolved);
}

/**
 * Calls `cb(prefersDark)` when the system theme changes. Returns an unsubscribe function.
 * Pass `window.matchMedia.bind(window)`.
 */
export function watchSystemTheme(matchMedia: MatchMediaLike, cb: (prefersDark: boolean) => void): () => void {
  const mql = matchMedia(PREFERS_DARK_QUERY);
  const listener = (e: { matches: boolean }): void => cb(e.matches);
  mql.addEventListener("change", listener);
  return () => mql.removeEventListener("change", listener);
}

/** Reads the current system theme once. */
export function systemPrefersDark(matchMedia: MatchMediaLike): boolean {
  return matchMedia(PREFERS_DARK_QUERY).matches;
}

/** The theme on the root now; anything but `light` reads as `dark`, the default. */
export function currentTheme(root: { getAttribute(name: string): string | null }): ResolvedTheme {
  return root.getAttribute("data-theme") === "light" ? "light" : "dark";
}

/**
 * Calls `cb(resolved)` each time `data-theme` changes on the root. For code that reads colours
 * from JS (a terminal, a canvas). Returns an unsubscribe function.
 * `makeObserver` is for tests; it defaults to `new MutationObserver(cb)`.
 */
export function onThemeChange<R extends ThemeRoot & { getAttribute(name: string): string | null }>(
  root: R,
  cb: (resolved: ResolvedTheme) => void,
  makeObserver: ObserverFactory = (fn) => new MutationObserver(fn),
): () => void {
  const observer = makeObserver(() => cb(currentTheme(root)));
  observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/**
 * Reads CSS custom properties from an element, e.g. `readThemeColors(el, ["--x-color-bg"])`.
 * Keys of the result are the names as given; a missing var reads as an empty string.
 * `getStyle` is for tests; it defaults to `getComputedStyle`.
 */
export function readThemeColors(
  el: Element,
  names: readonly string[],
  getStyle: (el: Element) => { getPropertyValue(name: string): string } = (e) => getComputedStyle(e),
): Record<string, string> {
  const style = getStyle(el);
  const out: Record<string, string> = {};
  for (const name of names) out[name] = style.getPropertyValue(name).trim();
  return out;
}
