import type { JSX, KeyboardEvent } from "react";
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
      onSelect?: () => void;
    };

export interface MenuProps {
  items: MenuEntry[];
  label?: string;
  /** Item focused when the menu mounts: "first" (default), "last" (ArrowUp on the trigger), or false to leave focus alone. */
  initialFocus?: "first" | "last" | false;
  /** Called after Esc, Tab, or choosing a plain item. Esc and selection return focus to the trigger first. */
  onClose?: () => void;
}

export function Menu({ items, label, initialFocus = "first", onClose }: MenuProps): JSX.Element {
  const focusTrigger = (el: HTMLElement): void => {
    const t = triggers.get(el);
    (t as HTMLElement | null | undefined)?.focus?.();
  };
  const select = (btn: HTMLElement, it: { onSelect?: () => void }, isCheck: boolean): void => {
    it.onSelect?.();
    if (isCheck) return;
    const menu = btn.closest<HTMLElement>('[role="menu"]');
    if (menu) focusTrigger(menu);
    onClose?.();
  };
  const ref = (el: HTMLDivElement | null): void => {
    if (!el || triggers.has(el)) return;
    triggers.set(el, document.activeElement);
    if (initialFocus === false) return;
    const list = Array.from(el.querySelectorAll<HTMLElement>(ITEMS));
    (initialFocus === "last" ? list[list.length - 1] : list[0])?.focus();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
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
    <div className="x-menu" role="menu" aria-label={label} ref={ref} onKeyDown={onKeyDown}>
      {items.map((it, i) => {
        if (it.type === "separator") return <div key={i} className="x-menu-sep" role="separator" />;
        if (it.type === "group")
          return (
            <div key={i} className="x-menu-group" role="presentation">
              {it.label}
            </div>
          );
        const isCheck = it.checked != null;
        return (
          <button
            key={i}
            type="button"
            className="x-menu-item"
            role={isCheck ? "menuitemcheckbox" : "menuitem"}
            aria-checked={isCheck ? Boolean(it.checked) : undefined}
            aria-disabled={it.disabled ? true : undefined}
            data-active={it.active ? "" : undefined}
            data-danger={it.danger ? "" : undefined}
            tabIndex={-1}
            onClick={it.disabled ? undefined : (e) => select(e.currentTarget, it, isCheck)}
          >
            {isCheck ? (
              <span className="x-menu-check" aria-hidden="true">
                {it.checked ? "✓" : ""}
              </span>
            ) : null}
            {it.swatch ? <span className="x-menu-swatch" style={{ background: `var(--x-tab-color-${it.swatch})` }} /> : null}
            <span className="x-menu-label">{it.label}</span>
            {it.chord ? <span className="x-menu-chord">{it.chord}</span> : null}
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
