import { Fragment, type CSSProperties, type JSX, type MouseEventHandler, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Disclosure } from "../Disclosure/Disclosure";
import { Icon } from "../Icon/Icon";
import { StatusDot, type StatusTone } from "../StatusDot/StatusDot";

export interface NavListItem {
  id: string;
  label: ReactNode;
  /** 16px icon before the label. */
  icon?: IconName;
  /** Count after the label, e.g. settings that match a search. */
  count?: number;
  /** Renders a link instead of a button. */
  href?: string;
  /** A dot at the end for the state of what the item leads to (a provider that failed). Needs `toneLabel`. */
  tone?: StatusTone;
  /** The state in words, for screen readers and the tooltip ("2 failing"). */
  toneLabel?: string;
  /**
   * Sub-items: the item becomes a branch that opens and closes (a native `details`, so keyboard and `aria-expanded`
   * come from the browser). A branch holding the current item opens on render. Nest up to three levels.
   */
  children?: NavListItem[];
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
  /** Opening a branch closes its open siblings (one submenu at a time, as in many admin sidebars). */
  accordion?: boolean;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<NavListLabels>;
  className?: string;
}

/** True when `id` is the item or one of its descendants. */
function holds(it: NavListItem, id: string | undefined): boolean {
  return id !== undefined && (it.id === id || !!it.children?.some((c) => holds(c, id)));
}

export function NavList({ items, value, onSelect, title, renderLink, collapsible, defaultOpen = true, accordion, labels, className }: NavListProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const group = Boolean(collapsible && title);
  const render = (list: NavListItem[], depth: number, parent: string): JSX.Element[] => list.map((it) => {
    const depthStyle = depth ? ({ ["--nav-depth" as string]: depth } as CSSProperties) : undefined;
    if (it.children?.length) {
      return (
        <details key={it.id} className="settings-nav-branch" name={accordion ? `nav-${parent}` : undefined} open={holds(it, value) || undefined}>
          <summary className="settings-nav-item" style={depthStyle} data-current={holds(it, value) ? "" : undefined}>
            {it.icon ? <Icon name={it.icon} size={16} className="settings-nav-icon" /> : null}
            <span className="settings-nav-label">{it.label}</span>
            <Icon name="chevron" size={14} className="settings-nav-chevron" />
          </summary>
          <div className="settings-nav-sub">{render(it.children, depth + 1, it.id)}</div>
        </details>
      );
    }
    const current = it.id === value ? ("page" as const) : undefined;
    const body = (
      <>
        {it.icon ? <Icon name={it.icon} size={16} className="settings-nav-icon" /> : null}
        <span className="settings-nav-label">{it.label}</span>
        {it.count != null ? <span className="settings-nav-count">{it.count}</span> : null}
        {it.tone ? (
          <span className="settings-nav-tone" title={it.toneLabel}>
            <StatusDot tone={it.tone} />
            {it.toneLabel ? <span className="x-sr-only">{it.toneLabel}</span> : null}
          </span>
        ) : null}
      </>
    );
    if (it.href) {
      const onClick = onSelect ? () => onSelect(it.id) : undefined;
      if (renderLink) {
        return <Fragment key={it.id}>{depthStyle ? <span className="settings-nav-depth" style={depthStyle}>{renderLink({ href: it.href, className: "settings-nav-item", "aria-current": current, onClick, children: body, item: it })}</span> : renderLink({ href: it.href, className: "settings-nav-item", "aria-current": current, onClick, children: body, item: it })}</Fragment>;
      }
      return (
        <a key={it.id} className="settings-nav-item" href={it.href} aria-current={current} onClick={onClick} style={depthStyle}>
          {body}
        </a>
      );
    }
    return (
      <button key={it.id} type="button" className="settings-nav-item" aria-current={current} onClick={() => onSelect?.(it.id)} style={depthStyle}>
        {body}
      </button>
    );
  });
  const rows = render(items, 0, "root");
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
