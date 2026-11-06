import { Fragment, type JSX, type MouseEventHandler, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Disclosure } from "../Disclosure/Disclosure";
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

/** Props handed to `renderLink`; spread them on your router's link. */
export interface NavListLinkProps {
  href: string;
  className: string;
  "aria-current"?: "page";
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
  /** The item being rendered. */
  item: NavListItem;
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
  /** Renders `href` items through your link component (e.g. Next `Link`) for client-side navigation. Default: a plain `<a>`. */
  renderLink?: (props: NavListLinkProps) => ReactNode;
  /** With a `title`: the title becomes a `Disclosure` head that shows and hides the items. */
  collapsible?: boolean;
  /** Initial open state when `collapsible`. Default true. */
  defaultOpen?: boolean;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<NavListLabels>;
  className?: string;
}

export function NavList({ items, value, onSelect, title, renderLink, collapsible, defaultOpen = true, labels, className }: NavListProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const group = Boolean(collapsible && title);
  const rows = items.map((it) => {
    const current = it.id === value ? ("page" as const) : undefined;
    const body = (
      <>
        {it.icon ? <Icon name={it.icon} size={16} className="settings-nav-icon" /> : null}
        <span className="settings-nav-label">{it.label}</span>
        {it.count != null ? <span className="settings-nav-count">{it.count}</span> : null}
      </>
    );
    if (it.href) {
      const onClick = onSelect ? () => onSelect(it.id) : undefined;
      if (renderLink) {
        return <Fragment key={it.id}>{renderLink({ href: it.href, className: "settings-nav-item", "aria-current": current, onClick, children: body, item: it })}</Fragment>;
      }
      return (
        <a key={it.id} className="settings-nav-item" href={it.href} aria-current={current} onClick={onClick}>
          {body}
        </a>
      );
    }
    return (
      <button key={it.id} type="button" className="settings-nav-item" aria-current={current} onClick={() => onSelect?.(it.id)}>
        {body}
      </button>
    );
  });
  return (
    <nav className={cx("settings-nav", className)} aria-label={typeof title === "string" ? title : l.nav} data-collapsible={group ? "" : undefined}>
      {group ? (
        <Disclosure title={title} defaultExpanded={defaultOpen} className="settings-nav-group">
          {rows}
        </Disclosure>
      ) : (
        <>
          {title ? <h2 className="settings-nav-title">{title}</h2> : null}
          {rows}
        </>
      )}
    </nav>
  );
}
