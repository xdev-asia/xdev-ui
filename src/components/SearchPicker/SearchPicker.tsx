import { useId, useState, type JSX, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { SearchInput } from "../SearchInput/SearchInput";

export interface SearchPickerItem {
  id: string;
  /** Main line. */
  title: ReactNode;
  /** Second line in muted text. */
  meta?: ReactNode;
  /** Before the text: an icon, StatusDot or Badge. */
  leading?: ReactNode;
  /** Shown but skipped by the arrow keys and ignored by Enter and click. */
  disabled?: boolean;
}

export interface SearchPickerLabels {
  /** aria-label of the clear button. */
  clear: string;
}

const DEFAULT_LABELS: SearchPickerLabels = { clear: "Clear search" };

export interface SearchPickerProps {
  /** The query. */
  value: string;
  onValueChange: (value: string) => void;
  /** The matches for `value`; the caller searches and filters. */
  items: SearchPickerItem[];
  /** Enter or a click on an enabled option. */
  onPick: (id: string) => void;
  /** A loading, empty or error line under the list; announced politely. */
  status?: ReactNode;
  placeholder?: string;
  /** Accessible name of the box and of the list. */
  label: string;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<SearchPickerLabels>;
  className?: string;
}

export interface KeyResult {
  /** The option that is active after the key. */
  active: string | null;
  /** An option to pick (Enter). */
  pick: string | null;
  /** Escape with a query: clear it and keep the key from reaching a parent dialog. */
  clear: boolean;
}

/** First enabled option, so the list is never active on a disabled row. */
function firstEnabled(items: SearchPickerItem[]): string | null {
  return items.find((i) => !i.disabled)?.id ?? null;
}

/** What a key does to the list: arrows move over enabled options, Enter picks, Escape clears a query. Pure, so it can be tested without a DOM. */
export function searchPickerKey(items: SearchPickerItem[], active: string | null, key: string, query: string): KeyResult {
  const enabled = items.filter((i) => !i.disabled);
  const at = enabled.findIndex((i) => i.id === active);
  const current = at >= 0 ? enabled[at].id : (enabled[0]?.id ?? null);
  if (key === "ArrowDown") return { active: enabled[Math.min(at + 1, enabled.length - 1)]?.id ?? null, pick: null, clear: false };
  if (key === "ArrowUp") return { active: enabled[Math.max(at - 1, 0)]?.id ?? null, pick: null, clear: false };
  if (key === "Enter") return { active: current, pick: current, clear: false };
  if (key === "Escape") return { active: current, pick: null, clear: query !== "" };
  return { active: current, pick: null, clear: false };
}

export function SearchPicker({ value, onValueChange, items, onPick, status, placeholder, label, labels, className }: SearchPickerProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const base = `x-search-picker-${useId()}`;
  const listId = `${base}-list`;
  const [chosen, setChosen] = useState<string | null>(null);
  // An active option that left the list falls back to the first enabled one.
  const active = items.some((i) => i.id === chosen && !i.disabled) ? chosen : firstEnabled(items);
  const optionId = (id: string): string => `${base}-opt-${id}`;

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (!["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) return;
    const result = searchPickerKey(items, active, e.key, value);
    if (e.key !== "Escape" || result.clear) e.preventDefault();
    if (result.clear) {
      e.stopPropagation();
      onValueChange("");
    }
    if (result.pick !== null) onPick(result.pick);
    else setChosen(result.active);
  };

  return (
    <div className={cx("x-search-picker", className)}>
      <SearchInput
        role="combobox"
        aria-expanded={items.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active === null ? undefined : optionId(active)}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={onKeyDown}
        onClear={() => onValueChange("")}
        labels={{ clear: l.clear }}
      />
      <div id={listId} className="x-search-picker-list" role="listbox" aria-label={label} hidden={items.length === 0}>
        {items.map((item) => (
          <div
            key={item.id}
            id={optionId(item.id)}
            className="x-list-row x-search-picker-option"
            role="option"
            aria-selected={item.id === active}
            aria-disabled={item.disabled ? true : undefined}
            data-selected={item.id === active ? "" : undefined}
            data-disabled={item.disabled ? "" : undefined}
            onMouseMove={() => (item.disabled ? undefined : setChosen(item.id))}
            onClick={() => (item.disabled ? undefined : onPick(item.id))}
          >
            <span className="x-list-row-main">
              {item.leading ? <span className="x-list-row-lead">{item.leading}</span> : null}
              <span className="x-list-row-text">
                <span className="x-list-row-title">{item.title}</span>
                {item.meta ? <span className="x-list-row-meta">{item.meta}</span> : null}
              </span>
            </span>
          </div>
        ))}
      </div>
      <div className="x-search-picker-status" aria-live="polite">
        {status ?? null}
      </div>
    </div>
  );
}
