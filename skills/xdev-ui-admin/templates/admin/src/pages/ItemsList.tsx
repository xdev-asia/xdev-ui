import { useMemo, useState, type JSX } from "react";
import { Banner, Button, DataTable, EmptyState, FilterChip, PageHeader, Pagination, SearchInput, StatusDot, pageSlice, type DataTableColumn, type StatusTone } from "@xdev-asia/ui";
import { can } from "../auth/permissions";
import type { Session } from "../auth/session";
import { useStore } from "../data/context";
import type { Item, ItemStatus } from "../data/store";
import { useLoad, type Load } from "../data/useLoad";
import { useI18n } from "../i18n";
import { href } from "../router";
import { useNotify } from "../notify";

export const STATUSES: ItemStatus[] = ["active", "draft", "archived"];
const TONE: Record<ItemStatus, StatusTone> = { active: "ok", draft: "warn", archived: "neutral" };

/** Pure: items whose name or owner contains the text and whose status is chosen (none chosen = all). */
export function filterItems(items: Item[], query: string, statuses: ReadonlySet<ItemStatus>): Item[] {
  const q = query.trim().toLowerCase();
  return items.filter((i) => (!q || i.name.toLowerCase().includes(q) || i.owner.toLowerCase().includes(q)) && (statuses.size === 0 || statuses.has(i.status)));
}

export interface ItemsViewProps {
  state: Load<Item[]>;
  canCreate: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  statuses: ReadonlySet<ItemStatus>;
  onStatusesChange: (s: ReadonlySet<ItemStatus>) => void;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onCreate: () => void;
  onRetry: () => void;
}

export function ItemsView(p: ItemsViewProps): JSX.Element {
  const { t, ui, date } = useI18n();
  const items = p.state.status === "ready" ? p.state.data : [];
  const filtered = useMemo(() => filterItems(items, p.query, p.statuses), [items, p.query, p.statuses]);
  const rows = pageSlice(filtered, p.page, p.pageSize);
  const filtering = Boolean(p.query.trim() || p.statuses.size);
  const clear = (): void => {
    p.onQueryChange("");
    p.onStatusesChange(new Set());
    p.onPageChange(1);
  };
  const toggle = (s: ItemStatus): void => {
    const next = new Set(p.statuses);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    p.onStatusesChange(next);
    p.onPageChange(1);
  };
  const columns: DataTableColumn<Item>[] = [
    { key: "name", header: t("items.columns.name"), cell: (i) => <a className="app-link" href={href.item(i.id)}>{i.name}</a> },
    { key: "owner", header: t("items.columns.owner"), hideNarrow: true, cell: (i) => i.owner },
    { key: "status", header: t("items.columns.status"), cell: (i) => <StatusDot tone={TONE[i.status]} label={t(`items.status.${i.status}`)} /> },
    { key: "updated", header: t("items.columns.updated"), hideNarrow: true, cell: (i) => date(i.updated) },
  ];
  const empty = filtering ? (
    <EmptyState
      size="inline"
      icon="search"
      title={p.query.trim() ? t("items.noMatchTitle", { query: p.query.trim() }) : t("items.noMatchFilters")}
      hint={t("items.noMatchHint")}
      actions={<Button variant="secondary" onClick={clear}>{t("items.clearFilters")}</Button>}
    />
  ) : (
    <EmptyState size="inline" icon="plus" title={t("items.emptyTitle")} hint={t("items.emptyHint")} actions={p.canCreate ? <Button variant="secondary" onClick={p.onCreate}>{t("items.create")}</Button> : undefined} />
  );
  return (
    <>
      <PageHeader title={t("items.title")} description={t("items.description")} actions={p.canCreate ? <Button icon="plus" onClick={p.onCreate}>{t("items.create")}</Button> : undefined} />
      {p.state.status === "error" ? (
        <Banner title={t("app.loadFailed")} action={<Button variant="secondary" onClick={p.onRetry}>{t("app.retry")}</Button>}>
          {t("app.loadFailedHint")}
        </Banner>
      ) : (
        <div className="app-stack">
          <form role="search" className="app-filters" onSubmit={(e) => e.preventDefault()}>
            <div className="app-filters-search">
              <SearchInput
                value={p.query}
                onChange={(e) => {
                  p.onQueryChange(e.target.value);
                  p.onPageChange(1);
                }}
                onClear={() => p.onQueryChange("")}
                placeholder={t("items.searchPlaceholder")}
                aria-label={t("items.searchLabel")}
                labels={ui.searchInput}
              />
            </div>
          </form>
          <div className="app-chips" role="group" aria-label={t("items.filterStatus")}>
            {STATUSES.map((s) => (
              <FilterChip key={s} pressed={p.statuses.has(s)} onClick={() => toggle(s)}>
                {t(`items.status.${s}`)}
              </FilterChip>
            ))}
          </div>
          <DataTable caption={t("items.table")} columns={columns} rows={rows} rowKey={(i) => i.id} loading={p.state.status === "loading"} empty={empty} labels={ui.dataTable} />
          <Pagination page={p.page} pageSize={p.pageSize} total={filtered.length} onPageChange={p.onPageChange} labels={ui.pagination} />
        </div>
      )}
    </>
  );
}

export function ItemsPage({ session }: { session: Session }): JSX.Element {
  const store = useStore();
  const { t } = useI18n();
  const notify = useNotify();
  const { state, reload } = useLoad(() => store.listItems(), [store]);
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<ReadonlySet<ItemStatus>>(new Set());
  const [page, setPage] = useState(1);
  return (
    <ItemsView
      state={state}
      canCreate={can(session.role, "items.create")}
      query={query}
      onQueryChange={setQuery}
      statuses={statuses}
      onStatusesChange={setStatuses}
      page={page}
      pageSize={10}
      onPageChange={setPage}
      onCreate={() =>
        store.createItem(`New item ${state.status === "ready" ? state.data.length + 1 : 1}`, session.name).then(
          () => {
            notify(t("items.created"));
            reload();
          },
          () => notify(t("app.loadFailed")),
        )
      }
      onRetry={reload}
    />
  );
}
