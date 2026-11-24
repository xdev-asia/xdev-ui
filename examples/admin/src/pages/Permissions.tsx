import { useState, type JSX } from "react";
import { Banner, Button, Card, PageHeader, Segmented, StatusDot } from "@xdev-asia/ui";
import { can, type Capability } from "../auth/permissions";
import { ROLE_IDS, type Role, type RoleId } from "../data/seed";
import { useI18n, type MessageKey } from "../i18n";
import { hrefFor, initialParam, replaceQuery } from "../router";
import { NAV, navFor } from "../shell/nav";
import { useNotify } from "../shell/notify";

const BUTTONS: { cap: Capability; label: MessageKey }[] = [
  { cap: "users.create", label: "permissions.createUsers" },
  { cap: "users.update", label: "permissions.updateUsers" },
  { cap: "users.delete", label: "permissions.deleteUsers" },
  { cap: "roles.update", label: "permissions.updateRoles" },
  { cap: "settings.update", label: "permissions.updateSettings" },
  { cap: "audit.export", label: "permissions.exportAudit" },
];

export interface PermissionsViewProps {
  roles: Role[];
  /** The role to preview first: the signed-in one. */
  initialRole: RoleId;
  /** The previewed role changed; the page writes it to the URL. */
  onRoleChange?: (role: RoleId) => void;
}

/** Shows what each role sees: the same `navFor` and `can` that drive the real sidebar and buttons. */
export function PermissionsView({ roles, initialRole, onRoleChange }: PermissionsViewProps): JSX.Element {
  const { t } = useI18n();
  const notify = useNotify();
  const [role, setRole] = useState<RoleId>(initialRole);
  const visible = new Set(navFor(roles, role).flatMap((g) => g.items.map((e) => e.id)));
  const pages = NAV.flatMap((g) => g.items.filter((e) => !e.external).map((e) => ({ ...e, group: g.title })));
  return (
    <>
      <PageHeader title={t("permissions.title")} description={t("permissions.description")} />
      <div className="app-stack">
        <div className="app-row">
          <Segmented label={t("permissions.previewAs")} value={role} onChange={(v) => {
              setRole(v as RoleId);
              onRoleChange?.(v as RoleId);
            }} options={ROLE_IDS.map((r) => ({ value: r, label: t(`roles.names.${r}`) }))} />
        </div>
        <Banner tone="info" title={t("permissions.previewTitle")}>
          {t("permissions.previewHint")}
        </Banner>
        <div className="app-grid app-grid-wide">
          <Card headingLevel={2} title={t("permissions.pages")} subtitle={t("permissions.pagesHint")} flush>
            <ul className="app-list app-check-list">
              {pages.map((e) => (
                <li key={e.id} className="app-check-row">
                  <span>
                    {t(e.label)} <span className="app-muted-inline">· {t(e.group)}</span>
                  </span>
                  <StatusDot tone={visible.has(e.id) ? "ok" : "neutral"} label={t(visible.has(e.id) ? "permissions.shown" : "permissions.hidden")} />
                </li>
              ))}
            </ul>
          </Card>
          <Card headingLevel={2} title={t("permissions.buttons")} subtitle={t("permissions.buttonsHint")}>
            <div className="app-chips">
              {BUTTONS.filter((b) => can(roles, role, b.cap)).map((b) => (
                <Button key={b.cap} variant="secondary" onClick={() => notify(t("permissions.previewTitle"))}>
                  {t(b.label)}
                </Button>
              ))}
            </div>
            <ul className="app-list app-check-list">
              {BUTTONS.map((b) => (
                <li key={b.cap} className="app-check-row">
                  <span>{t(b.label)}</span>
                  <StatusDot tone={can(roles, role, b.cap) ? "ok" : "neutral"} label={t(can(roles, role, b.cap) ? "permissions.shown" : "permissions.hidden")} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div>
          <Button variant="link" href={hrefFor.exception("403")}>
            {t("permissions.tryForbidden")}
          </Button>
        </div>
      </div>
    </>
  );
}

/** The preview starts at `?as=` when it names a role, else at the signed-in role. */
export function PermissionsPage({ roles, role }: { roles: Role[]; role: RoleId }): JSX.Element {
  const as = initialParam("as");
  return <PermissionsView roles={roles} initialRole={ROLE_IDS.includes(as as RoleId) ? (as as RoleId) : role} onRoleChange={(r) => replaceQuery({ as: r })} />;
}
