import { useState, type JSX } from "react";
import { PageHeader, Select, SettingRow, Switch, ThemeSwitch, type ThemePreference } from "@xdev-asia/ui";
import { LOCALES, useI18n, type Locale } from "../i18n";

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };

export interface SettingsPageProps {
  theme?: ThemePreference;
  onThemeChange?: (value: ThemePreference) => void;
}

export function SettingsPage({ theme = "dark", onThemeChange = () => {} }: SettingsPageProps): JSX.Element {
  const { t, ui, locale, setLocale } = useI18n();
  const [digest, setDigest] = useState(true);
  return (
    <>
      <PageHeader title={t("settings.title")} description={t("settings.description")} />
      <SettingRow id="setting-theme" label={t("settings.theme")} description={t("settings.themeHint")} control={<ThemeSwitch value={theme} onChange={onThemeChange} labels={ui.themeSwitch} />} />
      <SettingRow
        id="setting-language"
        controlId="select-language"
        label={t("settings.language")}
        description={t("settings.languageHint")}
        control={
          <Select id="select-language" aria-describedby="select-language-hint" value={locale} onChange={(e) => setLocale(e.target.value as Locale)} options={LOCALES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))} />
        }
      />
      <SettingRow
        id="setting-digest"
        controlId="switch-digest"
        label={t("settings.digest")}
        description={t("settings.digestHint")}
        control={<Switch id="switch-digest" aria-describedby="switch-digest-hint" checked={digest} onChange={(e) => setDigest(e.target.checked)} />}
      />
    </>
  );
}
