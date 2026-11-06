import { useState, type JSX } from "react";
import { cx } from "../../internal/cx";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { Icon } from "../Icon/Icon";
import { Popover } from "../Popover/Popover";
import { SearchInput } from "../SearchInput/SearchInput";
import { filterFacetOptions, toggleFacetValue } from "./facet-helpers";

export interface FacetOption {
  value: string;
  label: string;
  /** Items that match this option alone. */
  count?: number;
}

export interface FacetFilterLabels {
  /** aria-label of the search field. */
  search: string;
  /** aria-label of the search field's clear button. */
  clearSearch: string;
  /** Button that unchecks every option. */
  clear: string;
  /** Shown when the search matches no option. */
  noResults: string;
  /** Visually hidden after the trigger label while options are picked ("2 selected"). */
  selected: (count: number) => string;
}

const DEFAULT_LABELS: FacetFilterLabels = {
  search: "Search options",
  clearSearch: "Clear search",
  clear: "Clear",
  noResults: "No options match",
  selected: (n) => `${n} selected`,
};

export interface FacetFilterProps {
  /** The facet being filtered ("Status"); names the trigger and the panel. */
  label: string;
  options: FacetOption[];
  /** Values that are checked. */
  selected: string[];
  /** Next selection, in the order of `options`. */
  onChange: (next: string[]) => void;
  /** Shows the search field. Default: more than 7 options. */
  searchable?: boolean;
  /** Open on first render (previews, docs). */
  defaultOpen?: boolean;
  placement?: "bottom-start" | "bottom-end";
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<FacetFilterLabels>;
  className?: string;
}

export function FacetFilter({
  label,
  options,
  selected,
  onChange,
  searchable,
  defaultOpen = false,
  placement = "bottom-start",
  labels,
  className,
}: FacetFilterProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const picked = new Set(selected);
  const count = options.filter((o) => picked.has(o.value)).length;
  const showSearch = searchable ?? options.length > 7;
  const shown = showSearch ? filterFacetOptions(options, query) : options;
  const close = (): void => {
    setOpen(false);
    setQuery("");
  };
  return (
    <Popover
      open={open}
      onClose={close}
      placement={placement}
      label={label}
      className={cx("x-facet", className)}
      trigger={(t) => (
        <button type="button" className="task-chip x-facet-trigger" data-active={count ? "" : undefined} onClick={() => (open ? close() : setOpen(true))} {...t}>
          <span className="task-chip-label">{label}</span>
          {count ? (
            <>
              <span className="task-chip-count" aria-hidden="true">{count}</span>
              <span className="x-sr-only">{`, ${l.selected(count)}`}</span>
            </>
          ) : null}
          <Icon name="chevron" size={12} />
        </button>
      )}
    >
      {showSearch ? (
        <SearchInput
          size="sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
          labels={{ search: l.search, clear: l.clearSearch }}
        />
      ) : null}
      {shown.length ? (
        <ul className="x-facet-list">
          {shown.map((o) => (
            <li key={o.value}>
              <Checkbox
                checked={picked.has(o.value)}
                onChange={() => onChange(toggleFacetValue(selected, o.value, options))}
                label={
                  <span className="x-facet-option">
                    <span>{o.label}</span>
                    {o.count != null ? <span className="x-facet-count">{o.count}</span> : null}
                  </span>
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="x-facet-empty">{l.noResults}</p>
      )}
      <div className="x-facet-foot">
        <Button variant="secondary" disabled={!count} onClick={() => onChange([])}>
          {l.clear}
        </Button>
      </div>
    </Popover>
  );
}
