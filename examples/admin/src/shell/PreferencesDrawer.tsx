import type { JSX } from "react";
import { Button, Drawer, FormSection, Select, SettingRow, Switch, ThemeSwitch, type ThemePreference } from "@xdev-asia/ui";
import { LOCALES, useI18n, type Locale, type MessageKey } from "../i18n";
import { DEFAULT_PREFS, type Prefs } from "./prefs";

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };
const LAYOUT: { key: keyof Prefs; label: MessageKey; hint: MessageKey }[] = [
  { key: "collapsed", label: "prefs.collapsed", hint: "prefs.collapsedHint" },
  { key: "tabs", label: "prefs.tabs", hint: "prefs.tabsHint" },
  { key: "crumbs", label: "prefs.crumbs", hint: "prefs.crumbsHint" },
  { key: "footer", label: "prefs.footer", hint: "prefs.footerHint" },
];

export interface PreferencesDrawerProps {
  prefs: Prefs;
  onPrefs: (next: Prefs) => void;
  theme: ThemePreference;
  onTheme: (value: ThemePreference) => void;
  onClose: () => void;
  /** false renders the markup only, for tests. */
  modal?: boolean;
}

/** Look and layout of the console, applied as you change them; "Done" only closes. */
export function PreferencesDrawer({ prefs, onPrefs, theme, onTheme, onClose, modal = true }: PreferencesDrawerProps): JSX.Element {
  const { t, ui, locale, setLocale } = useI18n();
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
      <FormSection title={t("prefs.layout")}>
        {LAYOUT.map((row) => (
          <SettingRow
            key={row.key}
            controlId={`prefs-${row.key}`}
            label={t(row.label)}
            description={t(row.hint)}
            control={<Switch id={`prefs-${row.key}`} aria-describedby={`prefs-${row.key}-hint`} checked={prefs[row.key]} onChange={(e) => onPrefs({ ...prefs, [row.key]: e.target.checked })} />}
          />
        ))}
      </FormSection>
    </Drawer>
  );
}
