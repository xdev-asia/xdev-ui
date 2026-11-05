import type { JSX, KeyboardEvent, ReactNode } from "react";
import { cx } from "../../internal/cx";
import { IconButton } from "../IconButton/IconButton";

export interface AppShellLabels {
  openNav: string;
  closeNav: string;
  skipToContent: string;
  /** aria-label of the sidebar. */
  nav: string;
}

const DEFAULT_LABELS: AppShellLabels = { openNav: "Open navigation", closeNav: "Close navigation", skipToContent: "Skip to content", nav: "Navigation" };

export interface AppShellProps {
  /** Top of the sidebar: BrandMark + product name. */
  brand?: ReactNode;
  /** Sidebar content: one or more NavList. */
  nav: ReactNode;
  /** Bottom of the sidebar: account, version. */
  navFooter?: ReactNode;
  /** Start of the top bar, usually a Breadcrumb. */
  crumbs?: ReactNode;
  /** End of the top bar: search, notifications Popover, account Menu. */
  actions?: ReactNode;
  children: ReactNode;
  /** Toast elements, stacked bottom-right in a fixed .ws-toasts region. */
  toasts?: ReactNode;
  /** Drawer state below 768px; controlled. */
  navOpen?: boolean;
  onNavOpenChange?: (open: boolean) => void;
  /** id of <main>, target of the skip link. Default "main". */
  mainId?: string;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<AppShellLabels>;
  className?: string;
}

export function AppShell({ brand, nav, navFooter, crumbs, actions, children, toasts, navOpen = false, onNavOpenChange, mainId = "main", labels, className }: AppShellProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === "Escape" && navOpen) onNavOpenChange?.(false);
  };
  return (
    <div className={cx("x-shell x-ws", className)} data-nav-open={navOpen ? "true" : undefined} onKeyDown={onKeyDown}>
      <a
        className="x-skip-link"
        href={`#${mainId}`}
        onClick={(e) => {
          // Focus the region without touching location.hash, which hash-routed apps own.
          e.preventDefault();
          document.getElementById(mainId)?.focus();
        }}
      >
        {l.skipToContent}
      </a>
      {navOpen ? <button type="button" className="x-shell-backdrop" aria-label={l.closeNav} onClick={() => onNavOpenChange?.(false)} /> : null}
      <aside className="x-shell-side" aria-label={l.nav}>
        {brand ? <div className="x-shell-brand">{brand}</div> : null}
        <div className="x-shell-nav">{nav}</div>
        {navFooter ? <div className="x-shell-side-foot">{navFooter}</div> : null}
      </aside>
      <div className="x-shell-col">
        <header className="x-shell-top">
          <IconButton
            icon="menu"
            label={navOpen ? l.closeNav : l.openNav}
            className="x-shell-menu"
            aria-expanded={navOpen}
            onClick={() => onNavOpenChange?.(!navOpen)}
          />
          <div className="x-shell-crumbs">{crumbs}</div>
          <div className="x-shell-actions">{actions}</div>
        </header>
        <main className="x-shell-main" id={mainId} tabIndex={-1}>
          {children}
        </main>
      </div>
      {toasts ? <div className="x-shell-toasts ws-toasts">{toasts}</div> : null}
    </div>
  );
}
