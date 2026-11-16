import { useState, type JSX } from "react";
import { Button, DescriptionList, Dialog, FieldMessage, FormSection, PageHeader, SettingRow, Select, Switch, ThemeSwitch, type ThemePreference } from "@xdev-asia/ui";
import { AGENTS } from "../data";
import { LOCALES, useI18n, type Locale } from "../i18n";
import { useNotify } from "../notify";
import { can, useStore } from "../store";
import { ROLES, type Role } from "../workspace";

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", vi: "Tiếng Việt" };

export interface SettingsPageProps {
  theme: ThemePreference;
  onThemeChange: (value: ThemePreference) => void;
}

export function SettingsPage({ theme, onThemeChange }: SettingsPageProps): JSX.Element {
  const s = useStore();
  const { t, ui, locale, setLocale } = useI18n();
  const notify = useNotify();
  const [asking, setAsking] = useState(false);
  const [blocked, setBlocked] = useState(false);

  // Notifications need the browser's consent. A refusal leaves the switch off and says why.
  const setNotifications = async (on: boolean): Promise<void> => {
    if (!on) {
      s.setNotifications(false);
      return notify(t("settings.notifyOff"));
    }
    let permission = "denied";
    try {
      if (typeof Notification !== "undefined") permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    } catch {
      permission = "denied";
    }
    setBlocked(permission !== "granted");
    if (permission !== "granted") return;
    s.setNotifications(true);
    notify(t("settings.notifyOn"));
  };
  const waiting = s.approvals.filter((a) => !a.decided);
  // A stage gate is decided on its run, with its document: the stand-in device answers the plain requests.
  const oldest = waiting.filter((a) => a.kind !== "stage").sort((a, b) => b.waitedMin - a.waitedMin)[0];
  const nearest = waiting.filter((a) => a.expiresMin !== undefined).sort((a, b) => (a.expiresMin ?? 0) - (b.expiresMin ?? 0))[0];
  const decideFor = (id: string, choice: "approve" | "changes", by: string, note?: string): void => {
    const ask = s.approvals.find((a) => a.id === id);
    s.setApprovals((all) => all.map((a) => (a.id === id ? { ...a, decided: { choice, by, note, agoMin: 0 } } : a)));
    if (ask?.termId) s.setTerminals((all) => all.map((x) => (x.id === ask.termId ? { ...x, state: choice === "approve" ? "working" : "idle" } : x)));
  };
  const admin = can(s.role, "admin");
  return (
    <>
      <PageHeader title={t("settings.title")} description={t("settings.description")} />
      {AGENTS.map((agent) => (
        <SettingRow
          key={agent.id}
          id={`setting-default-${agent.id}`}
          controlId={`select-default-${agent.id}`}
          label={t("settings.defaultFor", { agent: agent.name })}
          description={admin ? t("settings.defaultHint") : t("roles.needAdmin", { role: t(`roles.${s.role}`) })}
          control={
            <Select
              id={`select-default-${agent.id}`}
              disabled={!admin}
              value={s.defaults[agent.id]}
              onChange={(e) => s.setDefaults((d) => ({ ...d, [agent.id]: e.target.value }))}
              options={[
                ...s.accounts.filter((a) => a.agent === agent.id && (a.status === "signed_in" || a.id === s.defaults[agent.id])).map((a) => ({ value: a.id, label: a.name })),
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
      <SettingRow
        id="setting-notify"
        controlId="switch-notify"
        label={t("settings.notify")}
        description={blocked ? t("settings.notifyBlocked") : t("settings.notifyHint")}
        control={
          <Switch
            id="switch-notify"
            checked={s.notifications}
            onChange={(e) => void setNotifications(e.target.checked)}
          />
        }
      />
      <SettingRow
        id="setting-session"
        label={t("settings.session")}
        description={t("settings.sessionHint", { name: s.device, role: t(`roles.${s.role}`) })}
        control={
          <Button variant="secondary" icon="sign-out" onClick={() => setAsking(true)}>
            {t("settings.unpair")}
          </Button>
        }
      />
      <FormSection title={t("settings.server")}>
        {admin ? (
          <DescriptionList
            items={[
              { term: t("settings.serverVersion"), value: "0.1.0", mono: true },
              { term: t("settings.serverAddr"), value: "127.0.0.1:47900", mono: true },
              { term: t("settings.serverLink"), value: "47800-47819", mono: true },
              { term: t("settings.serverHome"), value: "/home/xdev/.xdev", mono: true },
            ]}
          />
        ) : (
          <FieldMessage tone="info">{t("settings.serverAdminOnly")}</FieldMessage>
        )}
      </FormSection>
      <FormSection title={t("settings.showcase")} description={t("settings.showcaseHint")}>
        <SettingRow
          id="showcase-role"
          controlId="select-role"
          label={t("settings.viewAs")}
          description={t("settings.viewAsHint")}
          control={<Select id="select-role" value={s.role} onChange={(e) => s.setRole(e.target.value as Role)} options={ROLES.map((r) => ({ value: r, label: t(`roles.${r}`) }))} />}
        />
        <SettingRow
          id="showcase-link"
          label={t("settings.dropLink")}
          description={t("settings.dropLinkHint")}
          control={
            <Button variant="secondary" disabled={!s.online} onClick={() => s.setOnline(false)}>
              {t("settings.dropLinkDo")}
            </Button>
          }
        />
        <SettingRow
          id="showcase-expire"
          label={t("settings.expire")}
          description={t("settings.expireHint")}
          control={
            <Button
              variant="secondary"
              onClick={() => {
                s.setPairNote(true);
                s.setPaired(false);
              }}
            >
              {t("settings.expireDo")}
            </Button>
          }
        />
        <SettingRow
          id="showcase-other"
          label={t("settings.otherDevice")}
          description={oldest ? t("settings.otherDeviceHint") : t("settings.nothingPending")}
          control={
            <Button
              variant="secondary"
              disabled={!oldest}
              onClick={() => {
                if (!oldest) return;
                decideFor(oldest.id, "approve", "Pixel");
                notify(t("settings.otherDeviceDone", { title: oldest.title }));
              }}
            >
              {t("settings.otherDeviceDo")}
            </Button>
          }
        />
        <SettingRow
          id="showcase-deadline"
          label={t("settings.deadline")}
          description={nearest ? t("settings.deadlineHint") : t("settings.nothingPending")}
          control={
            <Button
              variant="secondary"
              disabled={!nearest}
              onClick={() => {
                if (!nearest) return;
                decideFor(nearest.id, "changes", "xdevd", t("approvals.timedOut"));
                notify(t("settings.deadlineDone", { title: nearest.title }));
              }}
            >
              {t("settings.deadlineDo")}
            </Button>
          }
        />
        <SettingRow id="showcase-conflict" controlId="switch-conflict" label={t("settings.conflict")} description={t("settings.conflictHint")} control={<Switch id="switch-conflict" checked={s.conflictNext} onChange={(e) => s.setConflictNext(e.target.checked)} />} />
      </FormSection>
      {asking ? (
        <Dialog
          alert
          modal
          busy={false}
          title={t("settings.unpairTitle")}
          confirmLabel={t("settings.unpair")}
          cancelLabel={t("add.cancel")}
          onCancel={() => setAsking(false)}
          onConfirm={() => {
            setAsking(false);
            s.setPaired(false);
          }}
        >
          {t("settings.unpairBody")}
        </Dialog>
      ) : null}
    </>
  );
}
