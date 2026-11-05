import { useMemo, type JSX } from "react";
import { Banner, Button, DataTable, DescriptionList, Disclosure, EmptyState, Field, FilterChip, PageHeader, Pagination, SearchInput, paginateRows, type DataTableColumn } from "@xdev-asia/ui";
import { can } from "../auth/permissions";
import type { Session } from "../auth/session";
import { useStore } from "../data/context";
import type { AuditEvent, AuditKind, Role } from "../data/seed";
import { useLoad, type Load } from "../data/useLoad";
import { useI18n } from "../i18n";
import { useNotify } from "../shell/notify";
import { useState } from "react";

export const KINDS: AuditKind[] = ["signIn", "userCreate", "userUpdate", "userDelete", "roleUpdate"];

export interface AuditFilters {
  actor: string;
  kinds: ReadonlySet<AuditKind>;
  /** yyyy-mm-dd or empty; both ends inclusive, in UTC. */
  from: string;
  to: string;
}

/** Pure: events that match the actor text, the chosen kinds and the date range. */
export function filterAudit(events: AuditEvent[], f: AuditFilters): AuditEvent[] {
  const q = f.actor.trim().toLowerCase();
  return events.filter((e) => {
    const day = e.time.slice(0, 10);
    return (!q || e.actor.toLowerCase().includes(q)) && (f.kinds.size === 0 || f.kinds.has(e.kind)) && (!f.from || day >= f.from) && (!f.to || day <= f.to);
  });
}

const cell = (v: string): string => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** Pure: the events as CSV text with a header line. */
export function auditCsv(events: AuditEvent[]): string {
  const lines = events.map((e) => [e.time, e.actor, e.kind, e.target, e.ip].map(cell).join(","));
  return ["time,actor,action,target,ip", ...lines].join("\n") + "\n";
}

export interface AuditLogViewProps {
  state: Load<AuditEvent[]>;
  canExport: boolean;
  filters: AuditFilters;
  onFiltersChange: (f: AuditFilters) => void;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
  onExport: () => void;
  onRetry: () => void;
}

export function AuditLogView(p: AuditLogViewProps): JSX.Element {
  const { t, ui, date } = useI18n();
  const events = p.state.status === "ready" ? p.state.data : [];
  const filtered = useMemo(() => filterAudit(events, p.filters), [events, p.filters]);
  const rows = paginateRows(filtered, p.page, p.pageSize);
  const change = (patch: Partial<AuditFilters>): void => {
    p.onFiltersChange({ ...p.filters, ...patch });
    p.onPageChange(1);
  };
  const toggle = (k: AuditKind): void => {
    const next = new Set(p.filters.kinds);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    change({ kinds: next });
  };

  const columns: DataTableColumn<AuditEvent>[] = [
    { key: "time", header: t("audit.columns.time"), mono: true, cell: (e) => date(e.time, true) },
    { key: "actor", header: t("audit.columns.actor"), cell: (e) => e.actor },
    { key: "action", header: t("audit.columns.action"), cell: (e) => t(`audit.actions.${e.kind}`) },
    { key: "target", header: t("audit.columns.target"), mono: true, hideNarrow: true, cell: (e) => e.target },
    {
      key: "details",
      header: t("audit.details"),
      hideNarrow: true,
      cell: (e) => (
        <Disclosure title={t("audit.details")} defaultExpanded={false}>
          <DescriptionList items={[{ term: t("audit.ip"), value: e.ip, mono: true }, { term: "ID", value: e.id, mono: true }]} />
        </Disclosure>
      ),
    },
  ];

  const empty = (
    <EmptyState
      size="inline"
      icon="search"
      title={t("audit.emptyTitle")}
      hint={t("audit.emptyHint")}
      actions={<Button variant="secondary" onClick={() => change({ actor: "", kinds: new Set(), from: "", to: "" })}>{t("users.clearFilters")}</Button>}
    />
  );

  return (
    <>
      <PageHeader
        title={t("audit.title")}
        description={t("audit.description")}
        actions={p.canExport ? <Button variant="secondary" icon="download" onClick={p.onExport}>{t("audit.export")}</Button> : undefined}
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
                value={p.filters.actor}
                onChange={(e) => change({ actor: e.target.value })}
                onClear={() => change({ actor: "" })}
                placeholder={t("audit.searchPlaceholder")}
                aria-label={t("audit.searchLabel")}
                labels={ui.searchInput}
              />
            </div>
            <Field label={t("audit.from")} type="date" value={p.filters.from} onChange={(e) => change({ from: e.target.value })} />
            <Field label={t("audit.to")} type="date" value={p.filters.to} onChange={(e) => change({ to: e.target.value })} />
          </div>
          <div className="app-chips" role="group" aria-label={t("audit.columns.action")}>
            {KINDS.map((k) => (
              <FilterChip key={k} pressed={p.filters.kinds.has(k)} onClick={() => toggle(k)}>
                {t(`audit.actions.${k}`)}
              </FilterChip>
            ))}
          </div>
          <DataTable caption={t("audit.table")} columns={columns} rows={rows} rowKey={(e) => e.id} loading={p.state.status === "loading"} empty={empty} labels={ui.dataTable} />
          <Pagination
            page={p.page}
            pageSize={p.pageSize}
            total={filtered.length}
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

export function AuditLogPage({ session, roles }: { session: Session; roles: Role[] }): JSX.Element {
  const store = useStore();
  const { t } = useI18n();
  const notify = useNotify();
  const { state, reload } = useLoad(() => store.listAudit(), [store]);
  const [filters, setFilters] = useState<AuditFilters>({ actor: "", kinds: new Set(), from: "", to: "" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const exportCsv = (): void => {
    if (state.status !== "ready") return;
    const url = URL.createObjectURL(new Blob([auditCsv(filterAudit(state.data, filters))], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify(t("audit.exported"));
  };
  return (
    <AuditLogView
      state={state}
      canExport={can(roles, session.role, "audit.export")}
      filters={filters}
      onFiltersChange={setFilters}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onExport={exportCsv}
      onRetry={reload}
    />
  );
}
