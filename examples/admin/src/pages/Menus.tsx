import { useMemo, useRef, useState, type JSX } from "react";
import { Button, DataTable, Drawer, EmptyState, Field, IconButton, PageHeader, SearchInput, Select, StatusDot, Switch, Tag, type DataTableColumn } from "@xdev-asia/ui";
import { can } from "../auth/permissions";
import type { Session } from "../auth/session";
import { branchIds, countNodes, filterTree, seedMenus, updateNode, visibleRows, type MenuItem, type MenuKind, type TreeNode, type TreeRow } from "../data/catalog";
import type { Role } from "../data/seed";
import { useI18n } from "../i18n";
import { TreeName, toggled } from "../parts/TreeName";
import { useNotify } from "../shell/notify";
import { focusFirstInvalid } from "../parts/focus";
import { initialParam, replaceQuery } from "../router";

const KINDS: MenuKind[] = ["group", "page", "link", "action"];

export interface MenusViewProps {
  tree: TreeNode<MenuItem>[];
  canEdit: boolean;
  onSave: (id: string, data: MenuItem) => void;
  /** Starting state, for tests and screenshots. */
  initialExpanded?: string[];
  initialQuery?: string;
  initialEditing?: string;
  /** The filter changed; the page writes it to the URL. */
  onQueryChange?: (q: string) => void;
}

/** Pure: menu form errors. */
export function validateMenu(m: MenuItem): { name?: "menus.nameRequired" } {
  return m.name.trim() ? {} : { name: "menus.nameRequired" };
}

export function MenusView({ tree, canEdit, onSave, initialExpanded, initialQuery = "", initialEditing, onQueryChange }: MenusViewProps): JSX.Element {
  const { t, ui, num } = useI18n();
  const [query, setQueryState] = useState(initialQuery);
  const setQuery = (q: string): void => {
    setQueryState(q);
    onQueryChange?.(q);
  };
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(initialExpanded ?? branchIds(tree).slice(0, 2)));
  const [editing, setEditing] = useState<string | null>(initialEditing ?? null);
  const q = query.trim().toLowerCase();
  const shown = useMemo(() => (q ? filterTree(tree, (m) => `${m.name} ${m.path} ${m.code}`.toLowerCase().includes(q)) : tree), [tree, q]);
  // While filtering, every branch that holds a match is open, so matches are never hidden.
  const rows = visibleRows(shown, q ? new Set(branchIds(shown)) : expanded);
  const all = branchIds(tree);
  const flat = visibleRows(tree, new Set(all));
  const current = editing ? flat.find((r) => r.id === editing) : undefined;

  const columns: DataTableColumn<TreeRow<MenuItem>>[] = [
    { key: "name", header: t("menus.name"), cell: (r) => <TreeName row={r} name={r.data.name} onToggle={(id) => setExpanded((s) => toggled(s, id))} /> },
    { key: "kind", header: t("menus.kind"), cell: (r) => <Tag>{t(`menus.${r.data.kind}`)}</Tag> },
    { key: "path", header: t("menus.path"), mono: true, hideNarrow: true, cell: (r) => (r.data.path ? <span translate="no">{r.data.path}</span> : "—") },
    { key: "code", header: t("menus.code"), mono: true, hideNarrow: true, cell: (r) => (r.data.code ? <span translate="no">{r.data.code}</span> : t("menus.none")) },
    { key: "order", header: t("menus.order"), align: "end", width: "min", mono: true, cell: (r) => num(r.data.order) },
    { key: "status", header: t("menus.status"), cell: (r) => <StatusDot tone={r.data.enabled ? "ok" : "neutral"} label={t(r.data.enabled ? "menus.enabled" : "menus.disabled")} /> },
    ...(canEdit
      ? [{ key: "actions", header: t("menus.actions"), width: "min" as const, sticky: "end" as const, cell: (r: TreeRow<MenuItem>) => <IconButton icon="edit" label={t("menus.edit", { name: r.data.name })} onClick={() => setEditing(r.id)} /> }]
      : []),
  ];

  return (
    <>
      <PageHeader title={t("menus.title")} description={t("menus.description")} meta={<Tag>{t("menus.count", { n: num(countNodes(tree)) })}</Tag>} />
      <div className="app-stack">
        <div className="app-filters">
          <div className="app-filters-search">
            <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery("")} placeholder={t("menus.placeholder")} aria-label={t("menus.filter")} autoComplete="off" spellCheck={false} labels={ui.searchInput} />
          </div>
          <Button variant="secondary" onClick={() => setExpanded(new Set(all))} disabled={!!q}>
            {t("menus.expandAll")}
          </Button>
          <Button variant="secondary" onClick={() => setExpanded(new Set())} disabled={!!q}>
            {t("menus.collapseAll")}
          </Button>
        </div>
        <DataTable
          caption={t("menus.title")}
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          labels={ui.dataTable}
          stack
          empty={<EmptyState title={t("menus.empty")} hint={t("menus.emptyHint")} actions={<Button variant="secondary" onClick={() => setQuery("")}>{t("app.clearFilter")}</Button>} />}
        />
      </div>
      {current ? (
        <MenuDrawer
          key={current.id}
          item={current.data}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            onSave(current.id, data);
            setEditing(null);
          }}
        />
      ) : null}
    </>
  );
}

function MenuDrawer({ item, onClose, onSave }: { item: MenuItem; onClose: () => void; onSave: (data: MenuItem) => void }): JSX.Element {
  const { t, ui } = useI18n();
  const [draft, setDraft] = useState(item);
  const [tried, setTried] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const errors = validateMenu(draft);
  const set = (patch: Partial<MenuItem>): void => setDraft((d) => ({ ...d, ...patch }));
  return (
    <Drawer
      title={t("menus.editTitle")}
      description={t("menus.editHint")}
      onClose={onClose}
      labels={ui.drawer}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("menus.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setTried(true);
              if (errors.name) focusFirstInvalid(form.current);
              else onSave({ ...draft, name: draft.name.trim() });
            }}
          >
            {t("menus.save")}
          </Button>
        </>
      }
    >
      <form ref={form} className="app-form" onSubmit={(e) => e.preventDefault()} autoComplete="off">
        <Field label={t("menus.name")} name="name" value={draft.name} onChange={(e) => set({ name: e.target.value })} error={tried && errors.name ? t(errors.name) : undefined} required />
        <Select label={t("menus.kind")} value={draft.kind} onChange={(e) => set({ kind: e.target.value as MenuKind })} options={KINDS.map((k) => ({ value: k, label: t(`menus.${k}`) }))} />
        <Field label={t("menus.path")} name="path" mono spellCheck={false} value={draft.path} onChange={(e) => set({ path: e.target.value })} />
        <Field label={t("menus.code")} name="code" mono spellCheck={false} value={draft.code} onChange={(e) => set({ code: e.target.value })} />
        <Field label={t("menus.order")} name="order" type="number" inputMode="numeric" min={1} value={String(draft.order)} onChange={(e) => set({ order: Math.max(1, Number(e.target.value) || 1) })} />
        <Switch label={t("menus.show")} checked={draft.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
      </form>
    </Drawer>
  );
}

export function MenusPage({ session, roles }: { session: Session; roles: Role[] }): JSX.Element {
  const { t } = useI18n();
  const notify = useNotify();
  const [tree, setTree] = useState(seedMenus);
  return (
    <MenusView
      tree={tree}
      initialQuery={initialParam("q") ?? ""}
      onQueryChange={(q) => replaceQuery({ q })}
      canEdit={can(roles, session.role, "settings.update")}
      onSave={(id, data) => {
        setTree((x) => updateNode(x, id, data));
        notify(t("menus.saved"));
      }}
    />
  );
}
