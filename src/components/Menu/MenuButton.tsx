import { useEffect, useId, useLayoutEffect, useRef, useState, type JSX, type KeyboardEvent } from "react";
import { cx } from "../../internal/cx";
import { usePortal } from "../../internal/portal";
import { onViewportChange, positionPanel } from "../../internal/position";
import type { IconName } from "../../icons";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import { Menu, type MenuEntry, type MenuProps } from "./Menu";
import { menuKeyStep, menuTriggerKey, menuTypeahead } from "./menu-keys";

export interface MenuButtonProps {
  items: MenuEntry[];
  /** Button text. With `variant="icon"` it is the aria-label and title. */
  label: string;
  /** Leading icon of the button; the glyph with `variant="icon"` (default "more"). */
  icon?: IconName;
  /** "icon" renders an IconButton. Default "secondary". */
  variant?: "primary" | "secondary" | "icon";
  /** Which trigger edge the menu lines up with. Default "start". */
  align?: "start" | "end";
  /** aria-label of the menu. Default: `label`. */
  menuLabel?: string;
  /** Renders `href` items through the app's link component (a Next.js `Link`). */
  renderLink?: MenuProps["renderLink"];
  disabled?: boolean;
  /** Render the menu into `document.body` (position: fixed, flips above when there is no room below). Default true. */
  portal?: boolean;
  className?: string;
}

const ITEM = '[role="menuitem"], [role="menuitemcheckbox"]';
const TYPEAHEAD_MS = 500;

export function MenuButton({
  items,
  label,
  icon,
  variant = "secondary",
  align = "start",
  menuLabel,
  renderLink,
  disabled,
  portal = true,
  className,
}: MenuButtonProps): JSX.Element {
  const id = useId();
  const menuId = `x-menubtn-${id}`;
  const triggerId = `${menuId}-trigger`;
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLSpanElement | null>(null);
  const pop = useRef<HTMLDivElement | null>(null);
  const menu = useRef<HTMLDivElement | null>(null);
  const focusOnOpen = useRef<"first" | "last">("first");
  const typed = useRef({ query: "", at: 0 });
  const inPortal = usePortal(portal);
  const portalled = inPortal.active;

  const itemEls = (): HTMLElement[] => Array.from(menu.current?.querySelectorAll<HTMLElement>(ITEM) ?? []);
  const triggerEl = (): HTMLElement | null => anchor.current?.querySelector<HTMLElement>("button") ?? null;
  const close = (restore = true): void => {
    setOpen(false);
    if (restore) triggerEl()?.focus();
  };
  const openAt = (where: "first" | "last"): void => {
    focusOnOpen.current = where;
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open) return;
    const els = itemEls();
    (focusOnOpen.current === "last" ? els[els.length - 1] : els[0])?.focus();
    if (!portalled) return;
    const place = (): void => void positionPanel(anchor.current, pop.current, { align });
    place();
    return onViewportChange(place);
  }, [open, portalled, align]); // eslint-disable-line react-hooks/exhaustive-deps -- refs are stable

  // Clicking elsewhere without the backdrop (e.g. focus moved by script) still closes it.
  useEffect(() => {
    if (!open) return;
    const onFocus = (e: FocusEvent): void => {
      const t = e.target as Node | null;
      if (t && !menu.current?.contains(t) && !anchor.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, [open]);

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>): void => {
    const where = menuTriggerKey(e.key);
    if (!where || disabled) return;
    e.preventDefault();
    openAt(where);
  };
  const onTriggerClick = (): void => {
    if (open) close(false);
    else openAt("first");
  };

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>): void => {
    const els = itemEls();
    const index = els.indexOf(document.activeElement as HTMLElement);
    const step = menuKeyStep(e.key, index, els.length);
    if (step?.type === "focus") {
      e.preventDefault();
      els[step.index]?.focus();
    } else if (step?.type === "close") {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (step?.type === "tab") {
      close();
    } else if (e.key === " " && (e.target as HTMLElement).tagName === "A") {
      e.preventDefault();
      (e.target as HTMLElement).click();
    } else if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const now = Date.now();
      const query = now - typed.current.at < TYPEAHEAD_MS ? typed.current.query + e.key : e.key;
      typed.current = { query, at: now };
      const labels = els.map((el) => el.querySelector(".x-menu-label")?.textContent ?? el.textContent ?? "");
      const hit = menuTypeahead(labels, index, query);
      if (hit != null) els[hit].focus();
    }
  };

  const aria = {
    id: triggerId,
    "aria-haspopup": "menu" as const,
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
    disabled,
    onKeyDown: onTriggerKey,
    onClick: onTriggerClick,
  };
  return (
    <span className={cx("x-menubutton", className)} ref={anchor}>
      {variant === "icon" ? (
        <IconButton icon={icon ?? "more"} label={label} {...aria} />
      ) : (
        <Button variant={variant} icon={icon} {...aria}>
          {label}
          <Icon name="chevron" className="x-menubutton-caret" />
        </Button>
      )}
      {open
        ? inPortal(
            <>
              <div className="ws-menu-backdrop" aria-hidden="true" onClick={() => close()} />
              <div className="x-menubutton-pop" data-align={align} data-portal={portalled ? "" : undefined} ref={pop}>
                <Menu
                  id={menuId}
                  ref={menu}
                  label={menuLabel ?? label}
                  items={items}
                  renderLink={renderLink}
                  roving
                  onAction={() => close()}
                  onKeyDown={onMenuKey}
                />
              </div>
            </>,
          )
        : null}
    </span>
  );
}
