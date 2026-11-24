import type { JSX, ReactNode } from "react";
import { IconButton } from "@xdev-asia/ui";
import type { TreeRow } from "../data/catalog";
import { useI18n } from "../i18n";

/**
 * First cell of a tree list in a DataTable: indented by depth, with an open and close button on rows that have
 * children. The button carries aria-expanded; leaves keep the same indent so names line up.
 */
export function TreeName<T>({ row, name, onToggle, children }: { row: TreeRow<T>; name: string; onToggle: (id: string) => void; children?: ReactNode }): JSX.Element {
  const { t } = useI18n();
  return (
    <span className="app-tree-name" style={{ paddingInlineStart: `calc(${row.depth} * var(--x-space-6))` }}>
      {row.hasChildren ? (
        <IconButton
          size="sm"
          icon={row.expanded ? "chevron" : "chevron-right"}
          label={row.expanded ? t("menus.collapse", { name }) : t("menus.expand", { name })}
          aria-expanded={row.expanded}
          onClick={() => onToggle(row.id)}
        />
      ) : (
        <span className="app-tree-spacer" aria-hidden="true" />
      )}
      {children ?? name}
    </span>
  );
}

/** Pure: the set after opening or closing one id. */
export function toggled(set: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
