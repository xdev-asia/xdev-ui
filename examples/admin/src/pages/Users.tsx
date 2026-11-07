import { useMemo, useState, type JSX } from "react";
import {
  Avatar, Banner, BulkBar, Button, DataTable, EmptyState, FacetFilter, FilterChip, PageHeader, Pagination, SearchInput, StatusDot, Tag,
  paginateRows, sortTableRows,
  type DataTableColumn, type StatusTone, type TableSort,
} from "@xdev-asia/ui";
import { can } from "../auth/permissions";
import type { Session } from "../auth/session";
import { useStore } from "../data/context";
import { ROLE_IDS, type Role, type RoleId, type User, type UserStatus } from "../data/seed";
import { useLoad, type Load } from "../data/useLoad";
import { useI18n } from "../i18n";
import { hrefFor, queryOf } from "../router";
import { useNotify } from "../shell/notify";

export const STATUSES: UserStatus[] = ["active", "invited", "suspended"];
const TONE: Record<UserStatus, StatusTone> = { active: "ok", invited: "warn", suspended: "danger" };

export interface UserFilters {
  query: string;
  statuses: ReadonlySet<UserStatus>;
  roles: ReadonlySet<RoleId>;
}

/** Pure: the users that match the search text (name or email), the chosen statuses and the chosen roles. */
export function filterUsers(users: User[], f: UserFilters): User[] {
  const q = f.query.trim().toLowerCase();
  return users.filter(
    (u) =>
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (f.statuses.size === 0 || f.statuses.has(u.status)) &&
      (f.roles.size === 0 || f.roles.has(u.role)),
  );
}

/** Pure: how many users each status has with the other filters applied (for the chip counts). */
export function statusCounts(users: User[], f: UserFilters): Record<UserStatus, number> {
  const base = filterUsers(users, { ...f, statuses: new Set() });
  return { active: base.filter((u) => u.status === "active").length, invited: base.filter((u) => u.status === "invited").length, suspended: base.filter((u) => u.status === "suspended").length };
}

/** Pure: how many users each role has with the other filters applied (for the role facet counts). */
export function roleCounts(users: User[], f: UserFilters): Record<RoleId, number> {
  const base = filterUsers(users, { ...f, roles: new Set() });
  return Object.fromEntries(ROLE_IDS.map((r) => [r, base.filter((u) => u.role === r).length])) as Record<RoleId, number>;
}

const sortValue = (u: User, key: string): string | number => (key === "lastSeen" ? (u.lastSeen ? Date.parse(u.lastSeen) : 0) : key === "name" ? u.name : key === "email" ? u.email : key === "role" ? u.role : u.status);

export interface UsersViewProps {
  state: Load<User[]>;
  /** The signed-in user's role and the permission matrix. */
  viewer: Pick<Session, "role">;
  roles: Role[];
  filters: UserFilters;
  onFiltersChange: (f: UserFilters) => void;
  sort: TableSort | null;
  onSortChange: (s: TableSort | null) => void;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
  selected: ReadonlySet<string>;
  onSelectedChange: (next: Set<string>) => void;
  onCreate: () => void;
  onSuspend: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  onRetry: () => void;
}

export function UsersView(p: UsersViewProps): JSX.Element {
  const { t, ui, date } = useI18n();
  const users = p.state.status === "ready" ? p.state.data : [];
  const canCreate = can(p.roles, p.viewer.role, "users.create");
  const canUpdate = can(p.roles, p.viewer.role, "users.update");
  const canDelete = can(p.roles, p.viewer.role, "users.delete");

  const filtered = useMemo(() => filterUsers(users, p.filters), [users, p.filters]);
  const sorted = useMemo(() => sortTableRows(filtered, p.sort, sortValue), [filtered, p.sort]);
  const rows = paginateRows(sorted, p.page, p.pageSize);
  const counts = statusCounts(users, p.filters);
  const byRole = roleCounts(users, p.filters);
  const ids = [...p.selected];
  const filtering = Boolean(p.filters.query.trim() || p.filters.statuses.size || p.filters.roles.size);

  const columns: DataTableColumn<User>[] = [
    {
      key: "name",
      header: t("users.columns.name"),
      sortable: true,
      cell: (u) => (
        <span className="app-person">
          <Avatar name={u.name} size="sm" />
          <a className="app-link" href={hrefFor.user(u.id)}>{u.name}</a>
        </span>
      ),
    },
    { key: "email", header: t("users.columns.email"), sortable: true, mono: true, hideNarrow: true, cell: (u) => u.email },
    { key: "role", header: t("users.columns.role"), sortable: true, cell: (u) => <Tag>{t(`roles.names.${u.role}`)}</Tag> },
    { key: "status", header: t("users.columns.status"), sortable: true, cell: (u) => <StatusDot tone={TONE[u.status]} label={t(`users.status.${u.status}`)} /> },
    { key: "lastSeen", header: t("users.columns.lastSeen"), sortable: true, hideNarrow: true, cell: (u) => (u.lastSeen ? date(u.lastSeen) : t("users.never")) },
  ];

  const change = (patch: Partial<UserFilters>): void => {
    p.onFiltersChange({ ...p.filters, ...patch });
    p.onPageChange(1);
  };
  const toggleStatus = (s: UserStatus): void => {
    const next = new Set(p.filters.statuses);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    change({ statuses: next });
  };

  const empty = filtering ? (
    <EmptyState
      size="inline"
      icon="search"
      title={p.filters.query.trim() ? t("users.noMatchTitle", { query: p.filters.query.trim() }) : t("users.noMatchFilters")}
      hint={t("users.noMatchHint")}
      actions={<Button variant="secondary" onClick={() => change({ query: "", statuses: new Set(), roles: new Set() })}>{t("users.clearFilters")}</Button>}
    />
  ) : (
    <EmptyState
      size="inline"
      icon="accounts"
      title={t("users.emptyTitle")}
      hint={t("users.emptyHint")}
      actions={canCreate ? <Button variant="primary" onClick={p.onCreate}>{t("users.create")}</Button> : undefined}
    />
  );

  return (
    <>
      <PageHeader
        title={t("users.title")}
        description={t("users.description")}
        actions={canCreate ? <Button variant="primary" icon="plus" onClick={p.onCreate}>{t("users.create")}</Button> : undefined}
      />
      {p.state.status === "error" ? (
        <Banner title={t("app.loadFailed")} action={<Button variant="secondary" onClick={p.onRetry}>{t("app.retry")}</Button>}>
          {t("app.loadFailedHint")}
        </Banner>
      ) : (
        <div className="app-stack">
          <div className="app-filters">
            <div className="app-filters-search">
              <SearchInput
                value={p.filters.query}
                onChange={(e) => change({ query: e.target.value })}
                onClear={() => change({ query: "" })}
                placeholder={t("users.searchPlaceholder")}
                aria-label={t("users.searchLabel")}
                labels={ui.searchInput}
              />
            </div>
            <FacetFilter
              label={t("users.filterRole")}
              options={ROLE_IDS.map((r) => ({ value: r, label: t(`roles.names.${r}`), count: byRole[r] }))}
              selected={[...p.filters.roles]}
              onChange={(next) => change({ roles: new Set(next as RoleId[]) })}
              placement="bottom-end"
              labels={ui.facetFilter}
            />
          </div>
          <div className="app-chips" role="group" aria-label={t("users.filterStatus")}>
            {STATUSES.map((s) => (
              <FilterChip key={s} pressed={p.filters.statuses.has(s)} count={counts[s]} onClick={() => toggleStatus(s)}>
                {t(`users.status.${s}`)}
              </FilterChip>
            ))}
          </div>
          <DataTable
            caption={t("users.table")}
            columns={columns}
            rows={rows}
            rowKey={(u) => u.id}
            rowLabel={(u) => u.name}
            sort={p.sort}
            onSortChange={p.onSortChange}
            selected={canUpdate || canDelete ? p.selected : undefined}
            onSelectedChange={p.onSelectedChange}
            loading={p.state.status === "loading"}
            empty={empty}
            labels={ui.dataTable}
          />
          {canUpdate || canDelete ? (
            <BulkBar count={p.selected.size} onClear={() => p.onSelectedChange(new Set())} labels={{ ...ui.bulkBar, selected: (count) => t("users.selected", { count }) }}>
              {canUpdate ? <Button variant="secondary" onClick={() => p.onSuspend(ids)}>{t("users.suspend")}</Button> : null}
              {canDelete ? <Button variant="secondary" onClick={() => p.onDelete(ids)}>{t("users.delete")}</Button> : null}
            </BulkBar>
          ) : null}
          <Pagination
            page={p.page}
            pageSize={p.pageSize}
            total={sorted.length}
            onPageChange={p.onPageChange}
            pageSizeOptions={[10, 20, 50]}
            onPageSizeChange={(n) => {
              p.onPageSizeChange(n);
              p.onPageChange(1);
            }}
            labels={ui.pagination}
          />
        </div>
      )}
    </>
  );
}

export interface UsersPageProps {
  session: Session;
  roles: Role[];
  onCreate: () => void;
  onDelete: (users: Pick<User, "id" | "name">[], done: () => void) => void;
  /** Bumped by the parent after a create or delete so the list reloads. */
  version: number;
}

export function UsersPage({ session, roles, onCreate, onDelete, version }: UsersPageProps): JSX.Element {
  const store = useStore();
  const { t } = useI18n();
  const notify = useNotify();
  const { state, reload } = useLoad(() => store.listUsers(), [store, version]);
  const [filters, setFilters] = useState<UserFilters>(() => ({ query: queryOf(typeof window === "undefined" ? "" : window.location.hash).get("q") ?? "", statuses: new Set(), roles: new Set() }));
  const [sort, setSort] = useState<TableSort | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  return (
    <UsersView
      state={state}
      viewer={session}
      roles={roles}
      filters={filters}
      onFiltersChange={setFilters}
      sort={sort}
      onSortChange={setSort}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      selected={selected}
      onSelectedChange={setSelected}
      onCreate={onCreate}
      onSuspend={(ids) =>
        store.setStatus(ids, "suspended").then(
          () => {
            notify(t("users.suspended", { count: ids.length }));
            setSelected(new Set());
            reload();
          },
          () => notify(t("app.loadFailed")),
        )
      }
      onDelete={(ids) => onDelete(state.status === "ready" ? state.data.filter((u) => ids.includes(u.id)) : [], () => setSelected(new Set()))}
      onRetry={reload}
    />
  );
}

