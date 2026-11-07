import { useRef, useState, type JSX, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { rovingIndex } from "../../internal/keys";

export interface TabsItem {
  id: string;
  label: ReactNode;
  /** Count or short status after the label, e.g. unread checks. */
  badge?: ReactNode;
  /** "danger" for failures; default is the accent. */
  badgeTone?: "accent" | "danger";
  disabled?: boolean;
}

export interface TabsProps {
  items: TabsItem[];
  /** Controlled selected id. */
  value?: string;
  /** Uncontrolled starting id; defaults to the first item. */
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** "underline" (panel and page tabs, default) or "pill" (compact switch inside a card). */
  variant?: "underline" | "pill";
  /** "md" (default) or "sm": a compact row for panel tabs beside a terminal (smaller type, tighter padding). */
  size?: "sm" | "md";
  /** aria-label of the tablist. */
  label?: string;
  /** When set, tab ids are `${idPrefix}-tab-${id}` and aria-controls points at `${idPrefix}-panel-${id}`. */
  idPrefix?: string;
  className?: string;
}

export function Tabs({ items, value, defaultValue, onChange, variant = "underline", size = "md", label, idPrefix, className }: TabsProps): JSX.Element {
  const [inner, setInner] = useState(defaultValue ?? items.find((t) => !t.disabled)?.id);
  const current = value ?? inner;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (id: string): void => {
    setInner(id);
    onChange?.(id);
  };
  const currentIndex = Math.max(0, items.findIndex((t) => t.id === current));
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const from = refs.current.findIndex((b) => b === e.target);
    const next = rovingIndex(e.key, from < 0 ? currentIndex : from, items.length, "horizontal", (i) => Boolean(items[i].disabled));
    if (next == null) return;
    e.preventDefault();
    refs.current[next]?.focus();
    select(items[next].id);
  };
  return (
    <div className={cx("kit-tabs", className)} role="tablist" aria-label={label} data-variant={variant} data-size={size === "sm" ? "sm" : undefined} onKeyDown={onKeyDown}>
      {items.map((t, i) => {
        const isSel = i === currentIndex;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            className="kit-tab"
            id={idPrefix ? `${idPrefix}-tab-${t.id}` : undefined}
            aria-controls={idPrefix ? `${idPrefix}-panel-${t.id}` : undefined}
            aria-selected={isSel}
            tabIndex={isSel ? 0 : -1}
            disabled={t.disabled}
            onClick={() => select(t.id)}
          >
            {t.label}
            {t.badge != null ? (
              <span className="kit-tab-badge" data-tone={t.badgeTone === "danger" ? "danger" : undefined}>
                {t.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
