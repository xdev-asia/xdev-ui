import { Fragment, type JSX, type KeyboardEventHandler, type MouseEvent, type ReactNode, type Ref } from "react";
import type { TabColor } from "../../types";

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
  /** Renders `href` items through the app's link component. Default: a plain `<a>`. */
  renderLink?: (props: MenuLinkProps) => ReactNode;
  /** Items get `tabindex="-1"`; the owner (MenuButton) moves focus between them. */
  roving?: boolean;
  /** Runs after any enabled item is chosen, e.g. to close the menu. */
  onAction?: () => void;
  id?: string;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  ref?: Ref<HTMLDivElement>;
}

export function Menu({ items, label, renderLink, roving, onAction, id, onKeyDown, ref }: MenuProps): JSX.Element {
  const tabIndex = roving ? -1 : undefined;
  return (
    <div className="x-menu" role="menu" aria-label={label} id={id} ref={ref} onKeyDown={onKeyDown}>
      {items.map((it, i) => {
        if (it.type === "separator") return <div key={i} className="x-menu-sep" role="separator" />;
        if (it.type === "group")
          return (
            <div key={i} className="x-menu-group" role="presentation">
              {it.label}
            </div>
          );
        const choose = it.disabled
          ? undefined
          : (): void => {
              it.onSelect?.();
              onAction?.();
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
            onClick: () => choose?.(),
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
        const isCheck = it.checked != null;
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
