import { useState, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import type { IconName } from "../../icons";
import { Drawer } from "../Drawer/Drawer";
import { Icon } from "../Icon/Icon";

export interface BottomNavItem {
  id: string;
  label: string;
  icon: IconName;
  /** Count on the icon. 0 or undefined shows nothing; above 99 shows "99+". */
  badge?: number;
}

export interface BottomNavMore {
  /** Label of the last tab, e.g. "More". */
  label: string;
  icon: IconName;
  /** The destinations that did not fit in the bar. */
  items: BottomNavItem[];
}

export interface BottomNavLabels {
  /** aria-label of the nav. */
  nav: string;
  /** Spoken after the label of an item with a badge, e.g. `3 new`. */
  badge: (count: number) => string;
}

const DEFAULT_LABELS: BottomNavLabels = { nav: "Main", badge: (n) => `${n} new` };

/** The bar shows at most this many tabs, the "more" tab included. */
export const BOTTOM_NAV_MAX = 5;

export interface BottomNavProps {
  /** Tabs of the bar. Beyond 5 (4 with `more`) they are dropped; move the rest into `more.items`. */
  items: BottomNavItem[];
  /** Id of the current destination, in `items` or `more.items`. */
  value?: string;
  onChange: (id: string) => void;
  /** Last tab that opens a bottom sheet listing the remaining destinations. */
  more?: BottomNavMore;
  /** Controlled open state of the sheet. Default: the component keeps it. */
  moreOpen?: boolean;
  onMoreOpenChange?: (open: boolean) => void;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<BottomNavLabels>;
  className?: string;
}

function Badge({ count, text }: { count?: number; text: (n: number) => string }): JSX.Element | null {
  if (!count || count < 1) return null;
  return (
    <>
      <span className="x-bottom-nav-badge" aria-hidden="true">
        {count > 99 ? "99+" : count}
      </span>
      <span className="x-sr-only">{text(count)}</span>
    </>
  );
}

export function BottomNav({ items, value, onChange, more, moreOpen, onMoreOpenChange, labels, className }: BottomNavProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [own, setOwn] = useState(false);
  const open = Boolean(more) && (moreOpen ?? own);
  const setOpen = (next: boolean): void => {
    setOwn(next);
    onMoreOpenChange?.(next);
  };
  const shown = items.slice(0, BOTTOM_NAV_MAX - (more ? 1 : 0));
  const inMore = Boolean(more && value != null && more.items.some((it) => it.id === value));
  const tab = (it: BottomNavItem, onClick: () => void): ReactNode => (
    <button key={it.id} type="button" className="x-bottom-nav-item" aria-current={it.id === value ? "page" : undefined} onClick={onClick}>
      <span className="x-bottom-nav-icon">
        <Icon name={it.icon} size={20} />
        <Badge count={it.badge} text={l.badge} />
      </span>
      <span className="x-bottom-nav-label">{it.label}</span>
    </button>
  );
  const moreCount = more ? more.items.reduce((sum, it) => sum + (it.badge ?? 0), 0) : 0;
  return (
    <>
      <nav className={cx("x-bottom-nav", className)} aria-label={l.nav}>
        {shown.map((it) => tab(it, () => onChange(it.id)))}
        {more ? (
          <button type="button" className="x-bottom-nav-item" aria-haspopup="dialog" aria-expanded={open} data-current={inMore ? "" : undefined} onClick={() => setOpen(!open)}>
            <span className="x-bottom-nav-icon">
              <Icon name={more.icon} size={20} />
              <Badge count={moreCount} text={l.badge} />
            </span>
            <span className="x-bottom-nav-label">{more.label}</span>
          </button>
        ) : null}
      </nav>
      {open && more ? (
        <Drawer side="bottom" title={more.label} onClose={() => setOpen(false)} className="x-bottom-nav-sheet">
          <ul className="x-bottom-nav-list">
            {more.items.map((it) => (
              <li key={it.id}>
                {tab({ ...it }, () => {
                  onChange(it.id);
                  setOpen(false);
                })}
              </li>
            ))}
          </ul>
        </Drawer>
      ) : null}
    </>
  );
}
