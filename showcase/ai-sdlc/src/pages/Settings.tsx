import type { Dispatch, JSX, SetStateAction } from "react";
import { PageHeader, SettingRow, Select, ThemeSwitch, type ThemePreference } from "@xdev-asia/ui";
import { AGENTS, type Account, type AgentId } from "../data";
import { LOCALES, useI18n, type Locale } from "../i18n";

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };

export interface SettingsPageProps {
  accounts: Account[];
  defaults: Record<AgentId, string>;
  setDefaults: Dispatch<SetStateAction<Record<AgentId, string>>>;
  theme?: ThemePreference;
  onThemeChange?: (value: ThemePreference) => void;
}

export function SettingsPage({ accounts, defaults, setDefaults, theme = "dark", onThemeChange = () => {} }: SettingsPageProps): JSX.Element {
  const { t, ui, locale, setLocale } = useI18n();
  return (
    <>
      <PageHeader title={t("settings.title")} description={t("settings.description")} />
      {AGENTS.map((agent) => (
        <SettingRow
          key={agent.id}
          id={`setting-default-${agent.id}`}
          controlId={`select-default-${agent.id}`}
          label={t("settings.defaultFor", { agent: agent.name })}
          description={t("settings.defaultHint")}
          control={
            <Select
              id={`select-default-${agent.id}`}
              value={defaults[agent.id]}
              onChange={(e) => setDefaults((d) => ({ ...d, [agent.id]: e.target.value }))}
              options={[
                ...accounts.filter((a) => a.agent === agent.id && (a.status === "signed_in" || a.id === defaults[agent.id])).map((a) => ({ value: a.id, label: a.name })),
                { value: "", label: t("settings.defaultNone") },
              ]}
            />
          }
        />
      ))}
      <SettingRow id="setting-theme" label={t("settings.theme")} description={t("settings.themeHint")} control={<ThemeSwitch value={theme} onChange={onThemeChange} labels={ui.themeSwitch} />} />
      <SettingRow
        id="setting-language"
        controlId="select-language"
        label={t("settings.language")}
        description={t("settings.languageHint")}
        control={<Select id="select-language" value={locale} onChange={(e) => setLocale(e.target.value as Locale)} options={LOCALES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))} />}
      />
    </>
  );
}
