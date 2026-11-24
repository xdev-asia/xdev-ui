import type { JSX, ReactNode } from "react";
import { Banner, Button, Card, DescriptionList, EmptyState, PageHeader, Segmented, StatusDot, Tag } from "@xdev-asia/ui";
import { can, type Capability } from "../auth/permissions";
import { demoAccounts, signIn, type Session } from "../auth/session";
import type { Role, RoleId } from "../data/seed";
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

/** Buttons gated by role, as react-antd-admin's "Admin visible" and "Admin & Common visible". */
const ROLE_BUTTONS: { roles: RoleId[]; label: MessageKey }[] = [
  { roles: ["owner", "admin"], label: "access.adminButton" },
  { roles: ["owner", "admin", "editor", "viewer"], label: "access.everyoneButton" },
];

/** Component form: renders its children only when the role holds the permission code. */
function Can({ roles, role, cap, children }: { roles: Role[]; role: RoleId; cap: Capability; children: ReactNode }): JSX.Element | null {
  return can(roles, role, cap) ? <>{children}</> : null;
}

/** Component form: renders its children only for the listed roles. */
function HasRole({ role, roles, children }: { role: RoleId; roles: RoleId[]; children: ReactNode }): JSX.Element | null {
  return roles.includes(role) ? <>{children}</> : null;
}

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
  // Function form: the page asks can() / a role check while it builds the list.
  const allowedButtons = BUTTONS.filter((b) => can(roles, session.role, b.cap));
  const roleButtons = ROLE_BUTTONS.filter((b) => b.roles.includes(session.role));
  const none = <EmptyState title={t("access.noButtons")} />;
  return (
    <>
      <PageHeader title={t("access.buttonsTitle")} description={t("access.buttonsDescription")} />
      <div className="app-stack">
        <AccountCard session={session} onSwitch={onSwitch} />
        {/* Component form: each button sits in a gate that renders it or nothing. */}
        <Card headingLevel={2} title={t("access.componentCode")} subtitle={t("access.componentCodeHint")}>
          {allowedButtons.length ? (
            <div className="app-chips">
              {BUTTONS.map((b) => (
                <Can key={b.cap} roles={roles} role={session.role} cap={b.cap}>
                  <Button variant="secondary">{t(b.label)}</Button>
                </Can>
              ))}
            </div>
          ) : (
            none
          )}
        </Card>
        <Card headingLevel={2} title={t("access.componentRole")} subtitle={t("access.componentRoleHint")}>
          <div className="app-chips">
            {ROLE_BUTTONS.map((b) => (
              <HasRole key={b.label} role={session.role} roles={b.roles}>
                <Button variant="secondary">{t(b.label)}</Button>
              </HasRole>
            ))}
          </div>
        </Card>
        <Card headingLevel={2} title={t("access.functionCode")} subtitle={t("access.functionCodeHint")}>
          {allowedButtons.length ? (
            <div className="app-chips">
              {allowedButtons.map((b) => (
                <Tag key={b.cap}>
                  <span translate="no">{b.cap}</span>
                </Tag>
              ))}
            </div>
          ) : (
            none
          )}
        </Card>
        <Card headingLevel={2} title={t("access.functionRole")} subtitle={t("access.functionRoleHint")}>
          <div className="app-chips">
            {roleButtons.map((b) => (
              <Tag key={b.label}>{t(b.label)}</Tag>
            ))}
          </div>
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
