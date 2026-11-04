import type { JSX } from "react";
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
      onSelect?: () => void;
    };

export interface MenuProps {
  items: MenuEntry[];
  label?: string;
}

export function Menu({ items, label }: MenuProps): JSX.Element {
  return (
    <div className="x-menu" role="menu" aria-label={label}>
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
            onClick={it.disabled ? undefined : it.onSelect}
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
