import { useMemo, useState, type JSX } from "react";
import { Avatar, Button, DataTable, EmptyState, PageHeader, SearchInput, StatusDot, Tag, type DataTableColumn } from "@xdev-asia/ui";
import { branchIds, countNodes, filterTree, seedDepartments, visibleRows, type Department, type TreeNode, type TreeRow } from "../data/catalog";
import { useI18n } from "../i18n";
import { TreeName, toggled } from "../parts/TreeName";
import { initialParam, replaceQuery } from "../router";

export interface DepartmentsViewProps {
  tree: TreeNode<Department>[];
  initialQuery?: string;
  onQueryChange?: (q: string) => void;
}

export function DepartmentsView({ tree, initialQuery = "", onQueryChange }: DepartmentsViewProps): JSX.Element {
  const { t, ui, num } = useI18n();
  const [query, setQueryState] = useState(initialQuery);
  const setQuery = (q: string): void => {
    setQueryState(q);
    onQueryChange?.(q);
  };
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(branchIds(tree)));
  const q = query.trim().toLowerCase();
  const shown = useMemo(() => (q ? filterTree(tree, (d) => `${d.name} ${d.lead}`.toLowerCase().includes(q)) : tree), [tree, q]);
  const rows = visibleRows(shown, q ? new Set(branchIds(shown)) : expanded);
  const columns: DataTableColumn<TreeRow<Department>>[] = [
    { key: "name", header: t("departments.name"), cell: (r) => <TreeName row={r} name={r.data.name} onToggle={(id) => setExpanded((s) => toggled(s, id))} /> },
    {
      key: "lead",
      header: t("departments.lead"),
      cell: (r) => (
        <span className="app-person">
          <Avatar name={r.data.lead} size="sm" />
          {r.data.lead}
        </span>
      ),
    },
    { key: "members", header: t("departments.members"), align: "end", width: "min", mono: true, cell: (r) => num(r.data.members) },
    { key: "status", header: t("departments.status"), cell: (r) => <StatusDot tone={r.data.enabled ? "ok" : "neutral"} label={t(r.data.enabled ? "departments.active" : "departments.paused")} /> },
  ];
  return (
    <>
      <PageHeader title={t("departments.title")} description={t("departments.description")} meta={<Tag>{t("departments.count", { n: num(countNodes(tree)) })}</Tag>} />
      <div className="app-stack">
        <div className="app-filters">
          <div className="app-filters-search">
            <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery("")} placeholder={t("departments.placeholder")} aria-label={t("departments.filter")} autoComplete="off" spellCheck={false} labels={ui.searchInput} />
          </div>
        </div>
        <DataTable
          caption={t("departments.title")}
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          labels={ui.dataTable}
          stack
          empty={<EmptyState title={t("departments.empty")} hint={t("departments.emptyHint")} actions={<Button variant="secondary" onClick={() => setQuery("")}>{t("app.clearFilter")}</Button>} />}
        />
      </div>
    </>
  );
}

export function DepartmentsPage(): JSX.Element {
  const [tree] = useState(seedDepartments);
  return <DepartmentsView tree={tree} initialQuery={initialParam("q") ?? ""} onQueryChange={(q) => replaceQuery({ q })} />;
}
