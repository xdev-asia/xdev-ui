import { Fragment, type JSX, type KeyboardEvent, type KeyboardEventHandler, type MouseEvent, type ReactNode, type Ref } from "react";
import { rovingIndex } from "../../internal/keys";
import type { TabColor } from "../../types";

const ITEMS = '[role^="menuitem"]:not([aria-disabled="true"])';
/** Trigger element per open menu, captured when the menu mounts so Esc can return focus to it. */
const triggers = new WeakMap<object, Element | null>();

/** Which item a trigger key opens the menu on: Enter, Space and ArrowDown open on the first, ArrowUp on the last. */
export function menuTriggerKey(key: string): "first" | "last" | null {
  if (key === "Enter" || key === " " || key === "ArrowDown") return "first";
  if (key === "ArrowUp") return "last";
  return null;
}

export type MenuEntry =
  | { type: "separator" }
  | { type: "group"; label: string }
  | {
      type?: "item";
      label: string;
      chord?: string;
      /** Set (true/false) to make it a menuitemcheckbox. */
      checked?: boolean;
      disabled?: boolean;
      danger?: boolean;
      active?: boolean;
      submenu?: boolean;
      swatch?: TabColor;
      /** Renders the item as `<a role="menuitem">`, so middle-click and Cmd/Ctrl-click open a new tab. */
      href?: string;
      onSelect?: () => void;
    };

/** Props `renderLink` must spread on its link (a Next.js `Link`, a router link). */
export interface MenuLinkProps {
  href: string;
  className: string;
  role: "menuitem";
  tabIndex?: number;
  "data-active"?: "";
  "data-danger"?: "";
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
}

export interface MenuProps {
  items: MenuEntry[];
  label?: string;
  /** Item focused when the menu mounts: "first" (default), "last" (ArrowUp on the trigger), or false to leave focus alone. */
  initialFocus?: "first" | "last" | false;
  /** Called after Esc, Tab, or choosing a plain item. Esc and selection return focus to the trigger first. */
  onClose?: () => void;
  /** Renders `href` items through the app's link component. Default: a plain `<a>`. */
  renderLink?: (props: MenuLinkProps) => ReactNode;
  /** The owner (MenuButton) handles the keyboard and focus; the menu does not move focus itself. */
  roving?: boolean;
  /** Runs after any enabled item is chosen, e.g. to close the menu. */
  onAction?: () => void;
  id?: string;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  ref?: Ref<HTMLDivElement>;
}

const setRef = <T,>(r: Ref<T> | undefined, el: T | null): void => {
  if (typeof r === "function") r(el);
  else if (r) (r as { current: T | null }).current = el;
};

export function Menu({ items, label, initialFocus = "first", onClose, renderLink, roving, onAction, id, onKeyDown, ref }: MenuProps): JSX.Element {
  // Items stay out of the Tab order; focus moves between them with the arrow keys.
  const tabIndex = -1;
  const focusTrigger = (el: HTMLElement): void => {
    const t = triggers.get(el);
    (t as HTMLElement | null | undefined)?.focus?.();
  };
  /** After a plain (not checkable) item is chosen in a standalone menu: focus back to the trigger, then close. */
  const closeFrom = (target: EventTarget | null | undefined): void => {
    const menu = (target as HTMLElement | null | undefined)?.closest?.<HTMLElement>('[role="menu"]');
    if (menu) focusTrigger(menu);
    onClose?.();
  };
  const ownRef = (el: HTMLDivElement | null): void => {
    setRef(ref, el);
    if (!el || triggers.has(el)) return;
    triggers.set(el, document.activeElement);
    if (initialFocus === false) return;
    const list = Array.from(el.querySelectorAll<HTMLElement>(ITEMS));
    (initialFocus === "last" ? list[list.length - 1] : list[0])?.focus();
  };
  const ownKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const el = e.currentTarget;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      focusTrigger(el);
      onClose?.();
      return;
    }
    if (e.key === "Tab") {
      onClose?.();
      return;
    }
    const list = Array.from(el.querySelectorAll<HTMLElement>(ITEMS));
    const at = list.indexOf(document.activeElement as HTMLElement);
    const next = rovingIndex(e.key, at, list.length, "vertical");
    if (next != null) {
      e.preventDefault();
      list[next]?.focus();
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== " ") {
      const enabled = Array.from(el.querySelectorAll<HTMLElement>('[role^="menuitem"]'));
      const start = enabled.indexOf(document.activeElement as HTMLElement);
      const ch = e.key.toLowerCase();
      for (let n = 1; n <= enabled.length; n++) {
        const cand = enabled[(start + n) % enabled.length];
        if (cand.getAttribute("aria-disabled") !== "true" && (cand.textContent ?? "").trim().toLowerCase().startsWith(ch)) {
          e.preventDefault();
          cand.focus();
          return;
        }
      }
    }
  };
  return (
    <div className="x-menu" role="menu" aria-label={label} id={id} ref={roving ? ref : ownRef} onKeyDown={roving ? onKeyDown : ownKeyDown}>
      {items.map((it, i) => {
        if (it.type === "separator") return <div key={i} className="x-menu-sep" role="separator" />;
        if (it.type === "group")
          return (
            <div key={i} className="x-menu-group" role="presentation">
              {it.label}
            </div>
          );
        const isCheck = it.checked != null;
        const choose = it.disabled
          ? undefined
          : (e?: MouseEvent<HTMLElement>): void => {
              it.onSelect?.();
              onAction?.();
              if (!roving && !isCheck) closeFrom(e?.currentTarget);
            };
        const content = (
          <>
            {it.swatch ? <span className="x-menu-swatch" style={{ background: `var(--x-tab-color-${it.swatch})` }} /> : null}
            <span className="x-menu-label">{it.label}</span>
            {it.chord ? <span className="x-menu-chord">{it.chord}</span> : null}
          </>
        );
        if (it.href != null) {
          if (it.disabled)
            return (
              <a key={i} className="x-menu-item" role="menuitem" aria-disabled="true" tabIndex={tabIndex} data-danger={it.danger ? "" : undefined}>
                {content}
              </a>
            );
          const linkProps: MenuLinkProps = {
            href: it.href,
            className: "x-menu-item",
            role: "menuitem",
            tabIndex,
            "data-active": it.active ? "" : undefined,
            "data-danger": it.danger ? "" : undefined,
            onClick: (e) => choose?.(e),
            children: content,
          };
          if (renderLink) return <Fragment key={i}>{renderLink(linkProps)}</Fragment>;
          const { children, ...rest } = linkProps;
          return (
            <a key={i} {...rest}>
              {children}
            </a>
          );
        }
        return (
          <button
            key={i}
            type="button"
            className="x-menu-item"
            role={isCheck ? "menuitemcheckbox" : "menuitem"}
            aria-checked={isCheck ? Boolean(it.checked) : undefined}
            aria-disabled={it.disabled ? true : undefined}
            tabIndex={tabIndex}
            data-active={it.active ? "" : undefined}
            data-danger={it.danger ? "" : undefined}
            onClick={choose}
          >
            {isCheck ? (
              <span className="x-menu-check" aria-hidden="true">
                {it.checked ? "✓" : ""}
              </span>
            ) : null}
            {content}
            {it.submenu ? (
              <span className="x-menu-arrow" aria-hidden="true">
                ›
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
