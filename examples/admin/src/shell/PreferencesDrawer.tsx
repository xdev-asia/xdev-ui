import type { JSX } from "react";
import { Button, Drawer, FormSection, Select, SettingRow, Switch, ThemeSwitch, type ThemePreference } from "@xdev-asia/ui";
import { LOCALES, useI18n, type Locale, type MessageKey } from "../i18n";
import { useNotify } from "./notify";
import { DEFAULT_PREFS, PREFS_KEY, type Prefs } from "./prefs";

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };
type Row = { key: keyof Prefs; label: MessageKey; hint: MessageKey };
const GENERAL: Row[] = [
  { key: "dynamicTitle", label: "prefs.dynamicTitle", hint: "prefs.dynamicTitleHint" },
  { key: "backToTop", label: "prefs.backToTop", hint: "prefs.backToTopHint" },
];
const LAYOUT: Row[] = [
  { key: "collapsed", label: "prefs.collapsed", hint: "prefs.collapsedHint" },
  { key: "tabs", label: "prefs.tabs", hint: "prefs.tabsHint" },
  { key: "tabsPersist", label: "prefs.tabsPersist", hint: "prefs.tabsPersistHint" },
  { key: "tabsTools", label: "prefs.tabsTools", hint: "prefs.tabsToolsHint" },
  { key: "crumbs", label: "prefs.crumbs", hint: "prefs.crumbsHint" },
  { key: "footer", label: "prefs.footer", hint: "prefs.footerHint" },
];

export interface PreferencesDrawerProps {
  prefs: Prefs;
  onPrefs: (next: Prefs) => void;
  theme: ThemePreference;
  onTheme: (value: ThemePreference) => void;
  onClose: () => void;
  /** "Clear preferences and sign out". */
  onSignOut?: () => void;
  /** false renders the markup only, for tests. */
  modal?: boolean;
}

/** Look and layout of the console, applied as you change them; "Done" only closes. */
export function PreferencesDrawer({ prefs, onPrefs, theme, onTheme, onClose, onSignOut, modal = true }: PreferencesDrawerProps): JSX.Element {
  const { t, ui, locale, setLocale } = useI18n();
  const notify = useNotify();
  const row = (r: Row) => (
    <SettingRow
      key={r.key}
      controlId={`prefs-${r.key}`}
      label={t(r.label)}
      description={t(r.hint)}
      control={<Switch id={`prefs-${r.key}`} aria-describedby={`prefs-${r.key}-hint`} checked={prefs[r.key]} disabled={r.key === "tabsPersist" || r.key === "tabsTools" ? !prefs.tabs : false} onChange={(e) => onPrefs({ ...prefs, [r.key]: e.target.checked })} />}
    />
  );
  return (
    <Drawer
      title={t("prefs.title")}
      description={t("prefs.description")}
      onClose={onClose}
      modal={modal}
      labels={ui.drawer}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              onPrefs(DEFAULT_PREFS);
              onTheme("dark");
            }}
          >
            {t("prefs.reset")}
          </Button>
          <Button variant="primary" onClick={onClose}>
            {t("prefs.done")}
          </Button>
        </>
      }
    >
      <FormSection title={t("prefs.appearance")}>
        <SettingRow label={t("prefs.theme")} control={<ThemeSwitch variant="icons" value={theme} onChange={onTheme} labels={ui.themeSwitch} />} />
        <SettingRow
          controlId="prefs-language"
          label={t("prefs.language")}
          control={<Select id="prefs-language" icon="globe" value={locale} onChange={(e) => setLocale(e.target.value as Locale)} options={LOCALES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))} />}
        />
      </FormSection>
      <FormSection title={t("prefs.general")}>{GENERAL.map(row)}</FormSection>
      <FormSection title={t("prefs.layout")}>{LAYOUT.map(row)}</FormSection>
      <div className="app-row">
        <Button
          variant="secondary"
          icon="copy"
          onClick={() => {
            void navigator.clipboard?.writeText(JSON.stringify({ ...prefs, theme, locale }, null, 2)).then(() => notify(t("prefs.copied")), () => {});
          }}
        >
          {t("prefs.copy")}
        </Button>
        {onSignOut ? (
          <Button
            variant="secondary"
            icon="sign-out"
            onClick={() => {
              try {
                window.localStorage.removeItem(PREFS_KEY);
                window.sessionStorage.clear();
              } catch {
                /* storage blocked: nothing kept */
              }
              onPrefs(DEFAULT_PREFS);
              onClose();
              onSignOut();
            }}
          >
            {t("prefs.clearSignOut")}
          </Button>
        ) : null}
      </div>
    </Drawer>
  );
}
