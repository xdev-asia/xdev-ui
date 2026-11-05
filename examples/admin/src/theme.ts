import { useEffect, useState } from "react";
import { applyTheme, resolveTheme, systemPrefersDark, watchSystemTheme, type ThemePreference } from "@xdev-asia/ui";

const KEY = "acme-theme";

function readPref(): ThemePreference {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "dark" || v === "light" || v === "system" ? v : "dark";
  } catch {
    return "dark";
  }
}

/** Theme preference with persistence; sets data-theme on <html> and follows the system when set to "system". */
export function useTheme(): [ThemePreference, (p: ThemePreference) => void] {
  const [pref, setPref] = useState<ThemePreference>("dark");
  useEffect(() => setPref(readPref()), []);
  useEffect(() => {
    const paint = (dark: boolean): void => applyTheme(document.documentElement, resolveTheme(pref, dark));
    paint(systemPrefersDark(window.matchMedia.bind(window)));
    if (pref !== "system") return;
    return watchSystemTheme(window.matchMedia.bind(window), paint);
  }, [pref]);
  const set = (p: ThemePreference): void => {
    setPref(p);
    try {
      window.localStorage.setItem(KEY, p);
    } catch {
      /* private mode: the choice lasts for this visit */
    }
  };
  return [pref, set];
}
