import type { JSX } from "react";
import { Banner, Button, Card, DescriptionList, EmptyState, PageHeader, Segmented, StatusDot, Tag } from "@xdev-asia/ui";
import { can, type Capability } from "../auth/permissions";
import { demoAccounts, signIn, type Session } from "../auth/session";
import type { Role } from "../data/seed";
import { useI18n, type MessageKey } from "../i18n";
import type { AccessPage } from "../router";
import { leaves, navFor, NAV } from "../shell/nav";
import { useNotify } from "../shell/notify";

const BUTTONS: { cap: Capability; label: MessageKey }[] = [
  { cap: "users.create", label: "permissions.createUsers" },
  { cap: "users.update", label: "permissions.updateUsers" },
  { cap: "users.delete", label: "permissions.deleteUsers" },
  { cap: "roles.update", label: "permissions.updateRoles" },
  { cap: "settings.update", label: "permissions.updateSettings" },
  { cap: "audit.export", label: "permissions.exportAudit" },
];

export interface AccessViewProps {
  page: AccessPage;
  session: Session;
  roles: Role[];
  /** Signs in as another demo account; the shell, menu and buttons follow. */
  onSwitch: (account: Session) => void;
  /** Front-end: the menu follows the role. Back-end: it also drops items switched off in System, Menus. */
  mode?: AccessMode;
  onModeChange?: (mode: AccessMode) => void;
  /** Paths the back-end mode hides. */
  hidden?: ReadonlySet<string>;
}

export type AccessMode = "front" | "back";

/** The account card shared by page and button control: who is signed in, and a button per other demo account. */
function AccountCard({ session, onSwitch }: Pick<AccessViewProps, "session" | "onSwitch">): JSX.Element {
  const { t } = useI18n();
  const others = demoAccounts().filter((a) => a.email !== session.email);
  return (
    <Card headingLevel={2} title={t("access.account")} subtitle={t("access.switchHint")}>
      <div className="app-row">
        <span>{session.name}</span>
        <Tag>{t(`roles.names.${session.role}`)}</Tag>
        {others.map((a) => (
          <Button key={a.email} variant="secondary" onClick={() => onSwitch(a)}>
            {t("access.signInAs", { name: a.name })}
          </Button>
        ))}
      </div>
    </Card>
  );
}

/** The access demo of react-antd-admin: mode, page control, button control and two role-only pages. */
export function AccessView({ page, session, roles, onSwitch, mode = "front", onModeChange, hidden }: AccessViewProps): JSX.Element {
  const { t } = useI18n();
  const modes = (
    <Card headingLevel={2} title={t("access.mode")} subtitle={t("access.modeHint")}>
      <Segmented
        label={t("access.mode")}
        value={mode}
        onChange={(v) => onModeChange?.(v as AccessMode)}
        disabled={!onModeChange}
        options={[
          { value: "front", label: t("access.front") },
          { value: "back", label: t("access.back") },
        ]}
      />
    </Card>
  );
  const use = (m: AccessMode) => <StatusDot tone={mode === m ? "ok" : "neutral"} label={t(mode === m ? "access.inUse" : "access.notInUse")} />;
  if (page === "mode")
    return (
      <>
        <PageHeader title={t("access.modeTitle")} description={t("access.modeDescription")} />
        <div className="app-stack">
          <Card headingLevel={2}>
            <DescriptionList
              items={[
                { term: t("access.front"), value: <span className="app-row">{use("front")}<span>{t("access.frontHint")}</span></span> },
                { term: t("access.back"), value: <span className="app-row">{use("back")}<span>{t("access.backHint")}</span></span> },
              ]}
            />
          </Card>
          {modes}
          <Banner tone="info" title={t("access.serverNote")} />
        </div>
      </>
    );
  if (page === "admin" || page === "common")
    return (
      <EmptyState
        size="center"
        icon="eye"
        title={t(page === "admin" ? "access.adminTitle" : "access.commonTitle")}
        hint={t(page === "admin" ? "access.adminHint" : "access.commonHint")}
      />
    );
  if (page === "pages") {
    const visible = new Set(leaves(navFor(roles, session.role, undefined, hidden)).map((l) => l.entry.id));
    return (
      <>
        <PageHeader title={t("access.pagesTitle")} description={t("access.pagesDescription")} />
        <div className="app-stack">
          <AccountCard session={session} onSwitch={onSwitch} />
          {modes}
          <Card headingLevel={2} title={t("permissions.pages")} subtitle={t("permissions.pagesHint")} flush>
            <ul className="app-list app-check-list">
              {leaves(NAV)
                .filter((l) => !l.entry.external)
                .map(({ entry, trail }) => (
                  <li key={entry.id} className="app-check-row">
                    <span>
                      {t(entry.label)} <span className="app-muted-inline">· {trail.map((b) => t(b.label)).join(" / ") || t("nav.dashboard")}</span>
                    </span>
                    <StatusDot tone={visible.has(entry.id) ? "ok" : "neutral"} label={t(visible.has(entry.id) ? "permissions.shown" : "permissions.hidden")} />
                  </li>
                ))}
            </ul>
          </Card>
        </div>
      </>
    );
  }
  const allowedButtons = BUTTONS.filter((b) => can(roles, session.role, b.cap));
  return (
    <>
      <PageHeader title={t("access.buttonsTitle")} description={t("access.buttonsDescription")} />
      <div className="app-stack">
        <AccountCard session={session} onSwitch={onSwitch} />
        <Card headingLevel={2} title={t("access.byRole")} subtitle={t("access.byRoleHint")}>
          {allowedButtons.length ? (
            <div className="app-chips">
              {allowedButtons.map((b) => (
                <Button key={b.cap} variant="secondary">
                  {t(b.label)}
                </Button>
              ))}
            </div>
          ) : (
            <EmptyState title={t("access.noButtons")} />
          )}
        </Card>
        <Card headingLevel={2} title={t("access.byCode")} subtitle={t("access.byCodeHint")}>
          {allowedButtons.length ? (
            <div className="app-chips">
              {allowedButtons.map((b) => (
                <Tag key={b.cap}>
                  <span translate="no">{b.cap}</span>
                </Tag>
              ))}
            </div>
          ) : (
            <EmptyState title={t("access.noButtons")} />
          )}
        </Card>
      </div>
    </>
  );
}

export function AccessPageView({ page, session, roles, mode, onModeChange, hidden }: { page: AccessPage; session: Session; roles: Role[] } & Pick<AccessViewProps, "mode" | "onModeChange" | "hidden">): JSX.Element {
  const { t } = useI18n();
  const notify = useNotify();
  return (
    <AccessView
      page={page}
      session={session}
      roles={roles}
      mode={mode}
      hidden={hidden}
      onModeChange={
        onModeChange &&
        ((m) => {
          onModeChange(m);
          notify(t("access.modeSwitched", { mode: t(m === "front" ? "access.front" : "access.back") }));
        })
      }
      onSwitch={(a) => {
        signIn(a);
        notify(t("access.switched", { name: a.name }));
      }}
    />
  );
}
