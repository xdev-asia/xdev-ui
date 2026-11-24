import { useState, type JSX } from "react";
import { Banner, Button, Checkbox, DataTable, Drawer, EmptyState, IconButton, PageHeader, SearchInput, Spinner, StatusDot, Tag, type DataTableColumn } from "@xdev-asia/ui";
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
  /** The edit drawer for `roleId` is open. */
  editing: boolean;
  onClose: () => void;
  /** The role being edited, with unsaved changes applied. */
  draft: Role | null;
  dirty: boolean;
  saving: boolean;
  onToggle: (resource: Resource, action: Action, value: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
  onRetry: () => void;
  /** Starting filter, for tests and shared links. */
  initialQuery?: string;
}

/** Pure: roles whose name (in the active language) or code contains the query. */
export function matchRoles(q: string, name: (id: RoleId) => string): RoleId[] {
  const s = q.trim().toLowerCase();
  return s ? ROLE_IDS.filter((id) => id.includes(s) || name(id).toLowerCase().includes(s)) : [...ROLE_IDS];
}

export function RolesView(p: RolesViewProps): JSX.Element {
  const { t, ui, num } = useI18n();
  const locked = p.roleId === "owner";
  const editable = p.canEdit && !locked;
  const roleName = t(`roles.names.${p.roleId}`);
  const [query, setQuery] = useState(p.initialQuery ?? "");
  const shown = matchRoles(query, (id) => t(`roles.names.${id}`));

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

  const roleRows: DataTableColumn<RoleId>[] = [
    { key: "name", header: t("roles.list"), cell: (id) => t(`roles.names.${id}`) },
    { key: "code", header: t("roles.code"), mono: true, cell: (id) => <span translate="no">{id}</span> },
    { key: "status", header: t("roles.status"), cell: () => <StatusDot tone="ok" label={t("roles.active")} /> },
    { key: "people", header: t("roles.people"), align: "end", mono: true, width: "min", cell: (id) => num(p.state.status === "ready" ? p.state.data.counts[id] : 0) },
    {
      key: "actions",
      header: t("roles.actions"),
      width: "min",
      sticky: "end",
      cell: (id) => <IconButton icon="edit" label={t("roles.edit", { role: t(`roles.names.${id}`) })} onClick={() => p.onRoleChange(id)} />,
    },
  ];
  return (
    <>
      <PageHeader title={t("roles.title")} description={t("roles.description")} meta={<Tag>{query.trim() ? `${num(shown.length)} / ${num(ROLE_IDS.length)}` : num(ROLE_IDS.length)}</Tag>} />
      {p.state.status === "error" ? (
        <Banner title={t("app.loadFailed")} action={<Button variant="secondary" onClick={p.onRetry}>{t("app.retry")}</Button>}>
          {t("app.loadFailedHint")}
        </Banner>
      ) : p.state.status === "loading" ? (
        <div className="app-pane"><Spinner size="md" label={ui.spinner.loading} /></div>
      ) : (
        <div className="app-stack">
          <div className="app-filters">
            <div className="app-filters-search">
              <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery("")} placeholder={t("roles.placeholder")} aria-label={t("roles.filter")} autoComplete="off" spellCheck={false} labels={ui.searchInput} />
            </div>
          </div>
          <DataTable caption={t("roles.list")} columns={roleRows} rows={shown} rowKey={(id) => id} labels={ui.dataTable} stack empty={<EmptyState icon="search" title={t("roles.empty")} />} />
        </div>
      )}
      {p.editing && p.state.status === "ready" ? (
        <Drawer
          size="wide"
          title={t("roles.editTitle", { role: roleName })}
          description={locked ? t("roles.ownerLocked") : t("roles.editHint")}
          onClose={p.onClose}
          busy={p.saving}
          labels={ui.drawer}
          footer={
            editable ? (
              <>
                <Button variant="secondary" disabled={!p.dirty || p.saving} onClick={p.onDiscard}>{t("roles.discard")}</Button>
                <Button variant="primary" disabled={!p.dirty || p.saving} onClick={p.onSave}>{t("roles.save")}</Button>
              </>
            ) : (
              <Button variant="secondary" onClick={p.onClose}>{t("roles.close")}</Button>
            )
          }
        >
          <div className="app-stack">
            {p.dirty ? <Banner title={t("roles.unsaved")}>{t("roles.unsavedHint")}</Banner> : null}
            <DataTable caption={t("roles.matrix", { role: roleName })} columns={columns} rows={RESOURCES} rowKey={(r) => r} labels={ui.dataTable} />
          </div>
        </Drawer>
      ) : null}
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
  const [editing, setEditing] = useState(false);
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
      onRoleChange={(id) => {
        setRoleId(id);
        setEditing(true);
      }}
      editing={editing}
      onClose={() => {
        setDrafts({ ...drafts, [roleId]: undefined });
        setEditing(false);
      }}
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
