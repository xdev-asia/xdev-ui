import { useState, type JSX } from "react";
import { Banner, Button, Field, FormSection, NavList, PageHeader, SettingRow, Select, Switch, ThemeSwitch, type ThemePreference } from "@xdev-asia/ui";
import { can } from "../auth/permissions";
import type { Session } from "../auth/session";
import type { Role } from "../data/seed";
import { LOCALES, useI18n, type Locale } from "../i18n";
import { hrefFor } from "../router";
import { useNotify } from "../shell/notify";

export const SECTIONS = ["general", "appearance", "security", "notifications"] as const;
export type Section = (typeof SECTIONS)[number];
export type Flag = "twoFactor" | "emailDigest" | "securityAlerts";
export type SessionLength = "8h" | "1d" | "7d";

/** Pure: a known section id, else "general". */
export const sectionOf = (value: string | undefined): Section => SECTIONS.find((s) => s === value) ?? "general";

export interface SettingsViewProps {
  section: Section;
  canEdit: boolean;
  orgName: string;
  orgError: boolean;
  onOrgName: (value: string) => void;
  onSaveOrg: () => void;
  theme: ThemePreference;
  onTheme: (value: ThemePreference) => void;
  locale: Locale;
  onLocale: (value: Locale) => void;
  flags: Record<Flag, boolean>;
  onFlag: (flag: Flag, value: boolean) => void;
  sessionLength: SessionLength;
  onSessionLength: (value: SessionLength) => void;
}

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };

export function SettingsView(p: SettingsViewProps): JSX.Element {
  const { t, ui } = useI18n();
  const off = !p.canEdit;
  const flag = (f: Flag, label: Parameters<typeof t>[0], hint: Parameters<typeof t>[0]): JSX.Element => (
    <SettingRow
      id={`setting-${f}`}
      controlId={`switch-${f}`}
      label={t(label)}
      description={t(hint)}
      control={<Switch id={`switch-${f}`} aria-describedby={`switch-${f}-hint`} checked={p.flags[f]} disabled={off} onChange={(e) => p.onFlag(f, e.target.checked)} />}
    />
  );

  return (
    <>
      <PageHeader title={t("settings.title")} description={t("settings.description")} />
      <div className="app-roles">
        <NavList
          title={t("settings.title")}
          labels={ui.navList}
          value={p.section}
          items={SECTIONS.map((s) => ({ id: s, label: t(`settings.sections.${s}`), href: hrefFor.settings(s) }))}
        />
        <div className="app-stack">
          {off ? <Banner title={t("settings.readOnly")}>{t("settings.readOnlyHint")}</Banner> : null}
          {p.section === "general" ? (
            <FormSection
              title={t("settings.sections.general")}
              actions={p.canEdit ? <Button onClick={p.onSaveOrg}>{t("settings.save")}</Button> : undefined}
            >
              <Field
                label={t("settings.orgName")}
                hint={t("settings.orgNameHint")}
                error={p.orgError ? t("settings.orgNameRequired") : undefined}
                value={p.orgName}
                disabled={off}
                onChange={(e) => p.onOrgName(e.target.value)}
              />
            </FormSection>
          ) : null}
          {p.section === "appearance" ? (
            <FormSection title={t("settings.sections.appearance")}>
              <SettingRow id="setting-theme" label={t("settings.theme")} description={t("settings.themeHint")} control={<ThemeSwitch value={p.theme} onChange={p.onTheme} labels={ui.themeSwitch} />} />
              <SettingRow
                id="setting-language"
                controlId="select-language"
                label={t("settings.language")}
                description={t("settings.languageHint")}
                control={
                  <Select
                    id="select-language"
                    aria-describedby="select-language-hint"
                    value={p.locale}
                    onChange={(e) => p.onLocale(e.target.value as Locale)}
                    options={LOCALES.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))}
                  />
                }
              />
            </FormSection>
          ) : null}
          {p.section === "security" ? (
            <FormSection title={t("settings.sections.security")}>
              {flag("twoFactor", "settings.twoFactor", "settings.twoFactorHint")}
              <SettingRow
                id="setting-session"
                controlId="select-session"
                label={t("settings.sessionLength")}
                description={t("settings.sessionLengthHint")}
                control={
                  <Select
                    id="select-session"
                    aria-describedby="select-session-hint"
                    value={p.sessionLength}
                    disabled={off}
                    onChange={(e) => p.onSessionLength(e.target.value as SessionLength)}
                    options={[
                      { value: "8h", label: t("settings.hours8") },
                      { value: "1d", label: t("settings.days1") },
                      { value: "7d", label: t("settings.days7") },
                    ]}
                  />
                }
              />
            </FormSection>
          ) : null}
          {p.section === "notifications" ? (
            <FormSection title={t("settings.sections.notifications")}>
              {flag("emailDigest", "settings.emailDigest", "settings.emailDigestHint")}
              {flag("securityAlerts", "settings.securityAlerts", "settings.securityAlertsHint")}
            </FormSection>
          ) : null}
        </div>
      </div>
    </>
  );
}

export interface SettingsPageProps {
  session: Session;
  roles: Role[];
  section: string | undefined;
  theme: ThemePreference;
  onThemeChange: (value: ThemePreference) => void;
}

export function SettingsPage({ session, roles, section, theme, onThemeChange }: SettingsPageProps): JSX.Element {
  const { t, locale, setLocale } = useI18n();
  const notify = useNotify();
  const [orgName, setOrgName] = useState("Acme");
  const [orgError, setOrgError] = useState(false);
  const [flags, setFlags] = useState<Record<Flag, boolean>>({ twoFactor: false, emailDigest: true, securityAlerts: true });
  const [sessionLength, setSessionLength] = useState<SessionLength>("1d");
  return (
    <SettingsView
      section={sectionOf(section)}
      canEdit={can(roles, session.role, "settings.update")}
      orgName={orgName}
      orgError={orgError}
      onOrgName={(v) => {
        setOrgName(v);
        setOrgError(false);
      }}
      onSaveOrg={() => {
        if (!orgName.trim()) return setOrgError(true);
        notify(t("settings.saved"));
      }}
      theme={theme}
      onTheme={onThemeChange}
      locale={locale}
      onLocale={setLocale}
      flags={flags}
      onFlag={(f, v) => setFlags({ ...flags, [f]: v })}
      sessionLength={sessionLength}
      onSessionLength={setSessionLength}
    />
  );
}
