import type { InputHTMLAttributes, JSX } from "react";
import { cx } from "../../internal/cx";
import { Icon } from "../Icon/Icon";
import { Kbd } from "../Kbd/Kbd";

export interface SearchInputLabels {
  /** aria-label of the input when no other label is given. */
  search: string;
  /** aria-label of the clear button. */
  clear: string;
  /** Result count read out after the input. */
  count: (n: number) => string;
}

const DEFAULT_LABELS: SearchInputLabels = {
  search: "Search",
  clear: "Clear search",
  count: (n) => (n === 1 ? "1 result" : `${n} results`),
};

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** "md" (34px, page search) by default; "sm" (26px) for panel filters and toolbars. */
  size?: "sm" | "md";
  /** Shows a clear button while `value` is not empty. */
  onClear?: () => void;
  /** Keyboard shortcut shown while the input is empty, e.g. "Ctrl K". */
  shortcut?: string;
  /** Number of matches; shown after the input and announced politely. */
  count?: number;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<SearchInputLabels>;
}

export function SearchInput({ size = "md", onClear, shortcut, count, labels, className, value, ...rest }: SearchInputProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const hasValue = value != null && String(value) !== "";
  const named = rest["aria-label"] != null || rest["aria-labelledby"] != null || rest.id != null;
  return (
    <div className={cx("search", className)} data-size={size}>
      <Icon name="search" className="search-icon" size={size === "sm" ? 14 : 16} />
      <input type="search" className="search-input" value={value} aria-label={named ? undefined : l.search} {...rest} />
      {count != null ? (
        <span className="search-count" aria-live="polite">
          {l.count(count)}
        </span>
      ) : null}
      {onClear && hasValue ? (
        <button type="button" className="search-clear" aria-label={l.clear} onClick={onClear}>
          <Icon name="close" size={14} />
        </button>
      ) : shortcut ? (
        <span className="ws-search-hint" aria-hidden="true">
          <Kbd>{shortcut}</Kbd>
        </span>
      ) : null}
    </div>
  );
}
