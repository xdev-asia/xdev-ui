import { useState, type JSX } from "react";
import { Banner, Button, Card, Checkbox, DataTable, FormSection, ListRow, PageHeader, Spinner, type DataTableColumn } from "@xdev-asia/ui";
import { can } from "../auth/permissions";
import type { Session } from "../auth/session";
import { useStore } from "../data/context";
import { ACTIONS, RESOURCES, ROLE_IDS, type Action, type Resource, type Role, type RoleId } from "../data/seed";
import { useLoad, type Load } from "../data/useLoad";
import { useI18n } from "../i18n";
import { useNotify } from "../shell/notify";

export interface RolesData {
  roles: Role[];
  counts: Record<RoleId, number>;
}

/** Pure: a copy of the role with one permission flipped. */
export function togglePermission(role: Role, resource: Resource, action: Action, value: boolean): Role {
  return { ...role, permissions: { ...role.permissions, [resource]: { ...role.permissions[resource], [action]: value } } };
}

export const samePermissions = (a: Role, b: Role): boolean => RESOURCES.every((r) => ACTIONS.every((x) => a.permissions[r][x] === b.permissions[r][x]));

export interface RolesViewProps {
  state: Load<RolesData>;
  canEdit: boolean;
  roleId: RoleId;
  onRoleChange: (id: RoleId) => void;
  /** The role being edited, with unsaved changes applied. */
  draft: Role | null;
  dirty: boolean;
  saving: boolean;
  onToggle: (resource: Resource, action: Action, value: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
  onRetry: () => void;
}

export function RolesView(p: RolesViewProps): JSX.Element {
  const { t, ui, num } = useI18n();
  const locked = p.roleId === "owner";
  const editable = p.canEdit && !locked;
  const roleName = t(`roles.names.${p.roleId}`);

  const columns: DataTableColumn<Resource>[] = [
    { key: "resource", header: t("roles.resource"), cell: (r) => t(`roles.resources.${r}`) },
    ...ACTIONS.map<DataTableColumn<Resource>>((a) => ({
      key: a,
      header: t(`roles.${a}`),
      align: "end",
      cell: (r) => (
        <Checkbox
          aria-label={`${roleName}: ${t(`roles.resources.${r}`)}, ${t(`roles.${a}`)}`}
          checked={p.draft?.permissions[r][a] ?? false}
          disabled={!editable}
          onChange={(e) => p.onToggle(r, a, e.target.checked)}
        />
      ),
    })),
  ];

  return (
    <>
      <PageHeader title={t("roles.title")} description={t("roles.description")} />
      {p.state.status === "error" ? (
        <Banner title={t("app.loadFailed")} action={<Button variant="secondary" onClick={p.onRetry}>{t("app.retry")}</Button>}>
          {t("app.loadFailedHint")}
        </Banner>
      ) : p.state.status === "loading" ? (
        <div className="app-pane"><Spinner size="md" label={ui.spinner.loading} /></div>
      ) : (
        <div className="app-roles">
          <Card title={t("roles.list")} flush>
            <ul className="app-list">
              {ROLE_IDS.map((id) => (
                <ListRow
                  as="li"
                  key={id}
                  title={t(`roles.names.${id}`)}
                  meta={t("roles.members", { count: num(p.state.status === "ready" ? p.state.data.counts[id] : 0) })}
                  selected={id === p.roleId}
                  onClick={() => p.onRoleChange(id)}
                />
              ))}
            </ul>
          </Card>
          <div className="app-stack">
            {p.dirty ? <Banner title={t("roles.unsaved")}>{t("roles.unsavedHint")}</Banner> : null}
            <FormSection
              title={t("roles.matrix", { role: roleName })}
              description={locked ? t("roles.ownerLocked") : undefined}
              actions={
                editable ? (
                  <>
                    <Button variant="secondary" disabled={!p.dirty || p.saving} onClick={p.onDiscard}>{t("roles.discard")}</Button>
                    <Button disabled={!p.dirty || p.saving} onClick={p.onSave}>{t("roles.save")}</Button>
                  </>
                ) : undefined
              }
            >
              <DataTable caption={t("roles.matrix", { role: roleName })} columns={columns} rows={RESOURCES} rowKey={(r) => r} labels={ui.dataTable} />
            </FormSection>
          </div>
        </div>
      )}
    </>
  );
}

export function RolesPage({ session, roles, onRolesChanged }: { session: Session; roles: Role[]; onRolesChanged: () => void }): JSX.Element {
  const store = useStore();
  const { t } = useI18n();
  const notify = useNotify();
  const { state, reload } = useLoad<RolesData>(async () => {
    const [list, users] = await Promise.all([store.listRoles(), store.listUsers()]);
    const counts = { owner: 0, admin: 0, editor: 0, viewer: 0 } as Record<RoleId, number>;
    for (const u of users) counts[u.role]++;
    return { roles: list, counts };
  }, [store]);
  const [roleId, setRoleId] = useState<RoleId>("admin");
  const [drafts, setDrafts] = useState<Partial<Record<RoleId, Role>>>({});
  const [saving, setSaving] = useState(false);
  const saved = state.status === "ready" ? state.data.roles.find((r) => r.id === roleId) ?? null : null;
  const draft = drafts[roleId] ?? saved;
  const dirty = Boolean(saved && draft && !samePermissions(saved, draft));

  return (
    <RolesView
      state={state}
      canEdit={can(roles, session.role, "roles.update")}
      roleId={roleId}
      onRoleChange={setRoleId}
      draft={draft}
      dirty={dirty}
      saving={saving}
      onToggle={(resource, action, value) => draft && setDrafts({ ...drafts, [roleId]: togglePermission(draft, resource, action, value) })}
      onDiscard={() => setDrafts({ ...drafts, [roleId]: undefined })}
      onSave={() => {
        if (!draft) return;
        setSaving(true);
        store.saveRole(draft).then(
          () => {
            notify(t("roles.saved"));
            setDrafts({ ...drafts, [roleId]: undefined });
            reload();
            onRolesChanged();
          },
          () => notify(t("app.loadFailed")),
        ).finally(() => setSaving(false));
      }}
      onRetry={reload}
    />
  );
}
