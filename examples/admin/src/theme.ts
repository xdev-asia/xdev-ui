import { useEffect, useState } from "react";
import { applyTheme, resolveTheme, systemPrefersDark, watchSystemTheme, type ThemePreference } from "@xdev-asia/ui";

const KEY = "acme-theme";

const valid = (v: string | null): v is ThemePreference => v === "dark" || v === "light" || v === "system";

/** Pure: the theme a `?theme=` query asks for (the device preview sets it on its frames), or null. */
export function themeFromSearch(search: string): ThemePreference | null {
  const v = new URLSearchParams(search).get("theme");
  return valid(v) ? v : null;
}

const forced = (): ThemePreference | null => (typeof window === "undefined" ? null : themeFromSearch(window.location.search));

function readPref(): ThemePreference {
  const f = forced();
  if (f) return f;
  try {
    const v = window.localStorage.getItem(KEY);
    return valid(v) ? v : "system";
  } catch {
    return "system";
  }
}

/** Theme preference with persistence; sets data-theme on <html> and follows the system when set to "system". */
export function useTheme(): [ThemePreference, (p: ThemePreference) => void] {
  const [pref, setPref] = useState<ThemePreference>("system");
  useEffect(() => setPref(readPref()), []);
  useEffect(() => {
    const paint = (dark: boolean): void => {
      applyTheme(document.documentElement, resolveTheme(pref, dark));
      // Browser chrome (mobile address bar) takes the page's own background, read after the theme applies.
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", getComputedStyle(document.body).backgroundColor);
    };
    paint(systemPrefersDark(window.matchMedia.bind(window)));
    if (pref !== "system") return;
    return watchSystemTheme(window.matchMedia.bind(window), paint);
  }, [pref]);
  const set = (p: ThemePreference): void => {
    setPref(p);
    // A theme set by the URL (a device preview frame) is for that view only; the stored choice stays as it was.
    if (forced()) return;
    try {
      window.localStorage.setItem(KEY, p);
    } catch {
      /* private mode: the choice lasts for this visit */
    }
  };
  return [pref, set];
}
