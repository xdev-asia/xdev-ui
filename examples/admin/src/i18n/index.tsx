import { createContext, useContext, useMemo, type JSX, type ReactNode } from "react";
import { en, type Dict } from "./en";
import { vi } from "./vi";
import { uiLabels } from "./xdev-ui-labels";

export type Locale = "en" | "vi";
export const LOCALES: readonly Locale[] = ["en", "vi"];
export const dictionaries: Record<Locale, Dict> = { en, vi };

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = { [K in keyof T & string]: T[K] extends string ? K : Join<K, Paths<T[K]>> }[keyof T & string];
/** Every dotted key of the dictionary, e.g. "users.status.active". */
export type MessageKey = Paths<Dict>;

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

/** Pure lookup with {name} interpolation; an unknown key returns the key itself. */
export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let node: unknown = dictionaries[locale];
  for (const part of key.split(".")) node = (node as Record<string, unknown> | undefined)?.[part];
  const text = typeof node === "string" ? node : key;
  return vars ? text.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m)) : text;
}

export function readLocale(value: string | null | undefined): Locale {
  return value === "vi" || value === "en" ? value : "en";
}

interface I18n {
  locale: Locale;
  t: Translate;
  /** Library labels for the active language. */
  ui: (typeof uiLabels)["en"];
  /** Format a number for the active language. */
  num: (n: number) => string;
  /** Format a date for the active language. */
  date: (value: string | number | Date, withTime?: boolean) => string;
  setLocale: (locale: Locale) => void;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ locale, onLocaleChange, children }: { locale: Locale; onLocaleChange?: (l: Locale) => void; children: ReactNode }): JSX.Element {
  const value = useMemo<I18n>(
    () => ({
      locale,
      t: (key, vars) => translate(locale, key, vars),
      ui: uiLabels[locale],
      num: (n) => new Intl.NumberFormat(locale).format(n),
      date: (v, withTime = false) =>
        new Intl.DateTimeFormat(locale, withTime ? { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" } : { dateStyle: "medium", timeZone: "UTC" }).format(new Date(v)),
      setLocale: (l) => onLocaleChange?.(l),
    }),
    [locale, onLocaleChange],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n needs <I18nProvider>");
  return v;
}
