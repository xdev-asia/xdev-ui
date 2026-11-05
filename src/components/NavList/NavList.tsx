import type { JSX, ReactNode } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";

export interface NavListItem {
  id: string;
  label: ReactNode;
  /** 16px icon before the label. */
  icon?: IconName;
  /** Count after the label, e.g. settings that match a search. */
  count?: number;
  /** Renders a link instead of a button. */
  href?: string;
}

export interface NavListLabels {
  /** aria-label of the nav when there is no title string. */
  nav: string;
}

const DEFAULT_LABELS: NavListLabels = { nav: "Sections" };

export interface NavListProps {
  items: NavListItem[];
  /** Id of the current section; gets aria-current="page". */
  value?: string;
  onSelect?: (id: string) => void;
  /** Heading above the items, e.g. "Settings". Also names the nav when it is a string. */
  title?: ReactNode;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<NavListLabels>;
  className?: string;
}

export function NavList({ items, value, onSelect, title, labels, className }: NavListProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <nav className={cx("settings-nav", className)} aria-label={typeof title === "string" ? title : l.nav}>
      {title ? <h2 className="settings-nav-title">{title}</h2> : null}
      {items.map((it) => {
        const current = it.id === value ? "page" : undefined;
        const body = (
          <>
            {it.icon ? <Icon name={it.icon} size={16} className="settings-nav-icon" /> : null}
            <span className="settings-nav-label">{it.label}</span>
            {it.count != null ? <span className="settings-nav-count">{it.count}</span> : null}
          </>
        );
        return it.href ? (
          <a key={it.id} className="settings-nav-item" href={it.href} aria-current={current} onClick={onSelect ? () => onSelect(it.id) : undefined}>
            {body}
          </a>
        ) : (
          <button key={it.id} type="button" className="settings-nav-item" aria-current={current} onClick={() => onSelect?.(it.id)}>
            {body}
          </button>
        );
      })}
    </nav>
  );
}
