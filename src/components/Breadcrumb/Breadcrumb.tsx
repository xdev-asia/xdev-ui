import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";

export interface BreadcrumbItem {
  label: ReactNode;
  /** Set in the mono face, for paths, branches and ids. */
  mono?: boolean;
  /** Renders the crumb as a link. */
  href?: string;
  /** Renders the crumb as a button. Ignored on the last crumb. */
  onClick?: () => void;
}

export interface BreadcrumbLabels {
  /** aria-label of the nav landmark. */
  breadcrumb: string;
}

const DEFAULT_LABELS: BreadcrumbLabels = { breadcrumb: "Breadcrumb" };

export interface BreadcrumbProps {
  /** From the root to the current place. The last item is the current one. */
  items: BreadcrumbItem[];
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<BreadcrumbLabels>;
  className?: string;
}

export function Breadcrumb({ items, labels, className }: BreadcrumbProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <nav className={cx("ws-crumbs", className)} aria-label={l.breadcrumb}>
      <ol className="ws-crumbs-list">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          const cls = cx("ws-crumb", it.mono && "ws-mono");
          let node: ReactNode;
          if (last) node = <span className={cls} aria-current="page">{it.label}</span>;
          else if (it.href) node = <a className={cls} href={it.href} onClick={it.onClick}>{it.label}</a>;
          else if (it.onClick) node = <button type="button" className={cls} onClick={it.onClick}>{it.label}</button>;
          else node = <span className={cls}>{it.label}</span>;
          return (
            <li key={i} className="ws-crumb-item">
              {node}
              {last ? null : <span className="ws-crumb-sep" aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
