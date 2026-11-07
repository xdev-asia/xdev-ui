import { useEffect, useId, useRef, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { focusFirst, focusableIn, isShown, restoreFocus, trapTarget } from "../../internal/focus";
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
  /** Phone tab bar, usually a `BottomNav`. Shown under `main` below 768px only; the sidebar covers wider screens. */
  bottomNav?: ReactNode;
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

export function AppShell({ brand, nav, navFooter, crumbs, actions, bottomNav, children, toasts, navOpen = false, onNavOpenChange, mainId = "main", labels, className }: AppShellProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const sideId = `x-shell-side-${useId()}`;
  const menuRef = useRef<HTMLButtonElement | null>(null);
  const sideRef = useRef<HTMLElement | null>(null);
  const backdropRef = useRef<HTMLButtonElement | null>(null);
  const colRef = useRef<HTMLDivElement | null>(null);
  const close = useRef(onNavOpenChange);
  close.current = onNavOpenChange;
  useEffect(() => {
    // The drawer only exists below 768px, where the menu button is shown.
    if (!navOpen || !isShown(menuRef.current)) return;
    const menu = menuRef.current;
    const col = colRef.current as (HTMLDivElement & { inert: boolean }) | null;
    if (col) col.inert = true;
    focusFirst(sideRef.current);
    const onKey = (e: globalThis.KeyboardEvent): void => {
      if (e.key === "Escape") {
        close.current?.(false);
      } else if (e.key === "Tab") {
        const items = [backdropRef.current, ...focusableIn(sideRef.current)].filter((x): x is HTMLElement => x != null);
        const target = trapTarget(items, document.activeElement, e.shiftKey);
        if (target) {
          e.preventDefault();
          target.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (col) col.inert = false;
      restoreFocus(menu);
    };
  }, [navOpen]);
  return (
    <div className={cx("x-shell x-ws", className)} data-nav-open={navOpen ? "true" : undefined} data-bottom-nav={bottomNav ? "" : undefined}>
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
      {navOpen ? <button type="button" ref={backdropRef} className="x-shell-backdrop" aria-label={l.closeNav} onClick={() => onNavOpenChange?.(false)} /> : null}
      <aside className="x-shell-side" id={sideId} ref={sideRef} aria-label={l.nav}>
        {brand ? <div className="x-shell-brand">{brand}</div> : null}
        <div className="x-shell-nav">{nav}</div>
        {navFooter ? <div className="x-shell-side-foot">{navFooter}</div> : null}
      </aside>
      <div className="x-shell-col" ref={colRef}>
        <header className="x-shell-top">
          <IconButton
            icon="menu"
            label={navOpen ? l.closeNav : l.openNav}
            className="x-shell-menu"
            ref={menuRef}
            aria-controls={sideId}
            aria-expanded={navOpen}
            onClick={() => onNavOpenChange?.(!navOpen)}
          />
          <div className="x-shell-crumbs">{crumbs}</div>
          <div className="x-shell-actions">{actions}</div>
        </header>
        <main className="x-shell-main" id={mainId} tabIndex={-1}>
          {children}
        </main>
        {bottomNav ? <div className="x-shell-bottom">{bottomNav}</div> : null}
      </div>
      {toasts ? <div className="x-shell-toasts ws-toasts">{toasts}</div> : null}
    </div>
  );
}
