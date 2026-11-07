import { useId, useState, type JSX, type KeyboardEvent, type ReactNode } from "react";
import type { IconName } from "../../icons";
import type { SessionState } from "../../types";
import { rovingIndex } from "../../internal/keys";
import { Icon } from "../Icon/Icon";
import { Kbd } from "../Kbd/Kbd";
import { Segmented } from "../Segmented/Segmented";
import { StatusDot } from "../StatusDot/StatusDot";

export interface PaletteRow {
  /** Stable id of the row; used as the React key and as `data-row-id`. */
  id?: string;
  /** Plain text of the row: the default filter, the match highlight and the accessible name. */
  title: string;
  /** Rendered instead of `title` when present (for example the title with fuzzy hits wrapped). `title` stays the string. */
  label?: ReactNode;
  detail?: string;
  state?: SessionState;
  icon?: IconName;
  /** Shortcut text on the right, after the detail. */
  hint?: string;
  /** Slot before the icon or status dot (for example a kind badge). */
  leading?: ReactNode;
  /** Slot on the right, after `hint` (for example a count or a digit key). */
  meta?: ReactNode;
  /** Row is shown but skipped by the arrow keys and cannot be selected. */
  disabled?: boolean;
}

export interface PaletteScope {
  value: string;
  label: string;
}

export interface CommandPaletteLabels {
  /** aria-label of the dialog when no title is given. */
  dialog: string;
  /** Input placeholder (the placeholder prop wins). */
  placeholder: string;
  /** aria-label of the input when no title is given (the title names it otherwise). Never the placeholder. */
  search: string;
  noMatches: string;
  move: string;
  open: string;
  close: string;
  /** aria-label of the scope row (only used with `scopes`). */
  scopes?: string;
}

const DEFAULT_LABELS: CommandPaletteLabels = {
  dialog: "Command palette",
  placeholder: "Search sessions, files, commands",
  search: "Search",
  noMatches: "No matches",
  move: "move",
  open: "open",
  close: "close",
  scopes: "Scope",
};

export interface CommandPaletteProps {
  title?: string;
  placeholder?: string;
  defaultQuery?: string;
  filters?: string[];
  sections: { title: string; rows: PaletteRow[] }[];
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<CommandPaletteLabels>;
  /** Controlled visibility: `false` renders nothing, and a backdrop wraps the dialog. Absent: always rendered inline. */
  open?: boolean;
  /** Called on Escape and on a backdrop click. */
  onClose?: () => void;
  /** Called with the row on click or Enter on the active row. */
  onSelect?: (row: PaletteRow) => void;
  /** Controlled query; pair with `onQueryChange`. `defaultQuery` seeds the uncontrolled one. */
  query?: string;
  onQueryChange?: (query: string) => void;
  /** Scope row under the input (for example all, files, commands). The app filters `sections` itself. */
  scopes?: PaletteScope[];
  /** Controlled scope value; the first scope when absent. */
  scope?: string;
  onScopeChange?: (scope: string) => void;
  /** Replaces the "No matches" text. */
  emptyText?: ReactNode;
  /** Extra content on the right of the key-hint bar. */
  footer?: ReactNode;
  /**
   * Row filter. `true` (default): case-insensitive substring match on `title`.
   * `false`: rows are shown as given, in order (the app filters and ranks).
   * A function replaces the test; it gets the row and the current query.
   */
  filter?: boolean | ((row: PaletteRow, query: string) => boolean);
}

function highlight(text: string, query: string): ReactNode {
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="pal-hit">{text.slice(i, i + query.length)}</span>
      {text.slice(i + query.length)}
    </>
  );
}

/** Ref callback of the active row. Stable, so it fires only when the active row changes and keeps it inside the scrolled list. */
function reveal(el: HTMLElement | null): void {
  el?.scrollIntoView?.({ block: "nearest" });
}

export function CommandPalette({
  title,
  placeholder,
  defaultQuery = "",
  filters,
  sections,
  labels,
  open,
  onClose,
  onSelect,
  query,
  onQueryChange,
  scopes,
  scope,
  onScopeChange,
  emptyText,
  footer,
  filter: rowFilter = true,
}: CommandPaletteProps): JSX.Element | null {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [inner, setQ] = useState(defaultQuery);
  const q = query ?? inner;
  const [filter, setFilter] = useState<string | null>(filters?.[0] ?? null);
  const needle = q.toLowerCase();
  const keep = (r: PaletteRow): boolean => {
    if (rowFilter === false) return true;
    if (typeof rowFilter === "function") return rowFilter(r, q);
    return !needle || r.title.toLowerCase().includes(needle);
  };
  const shown = sections
    .map((s) => ({ title: s.title, rows: s.rows.filter(keep) }))
    .filter((s) => s.rows.length > 0);
  const uid = useId();
  const titleId = `${uid}-title`;
  const listId = `${uid}-list`;
  const optionId = (n: number): string => `${uid}-opt-${n}`;
  const flat = shown.flatMap((s) => s.rows);
  const count = flat.length;
  const [at, setAt] = useState(0);
  const [innerScope, setInnerScope] = useState(scopes?.[0]?.value);
  const clamped = count ? Math.min(at, count - 1) : -1;
  const active = clamped >= 0 && flat[clamped]?.disabled ? flat.findIndex((r) => !r.disabled) : clamped;
  const select = (row: PaletteRow | undefined): void => {
    if (row && !row.disabled) onSelect?.(row);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      if (!onSelect || active < 0) return;
      e.preventDefault();
      select(flat[active]);
      return;
    }
    const next = rovingIndex(e.key, active, count, "vertical", (i) => !!flat[i]?.disabled);
    if (next == null) return;
    e.preventDefault();
    setAt(next);
  };
  if (open === false) return null;
  const framed = open !== undefined || onClose !== undefined;
  let n = 0;
  const dialog = (
    <div
      className="palette"
      role="dialog"
      aria-modal={framed ? true : undefined}
      aria-label={title ?? l.dialog}
      onKeyDown={(e) => {
        if (e.key === "Escape" && onClose) {
          e.preventDefault();
          onClose();
        }
      }}
    >
      {title ? <div className="pal-title" id={titleId}>{title}</div> : null}
      <input
        className="pal-input"
        placeholder={placeholder ?? l.placeholder}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          onQueryChange?.(e.target.value);
          setAt(0);
        }}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={count > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? optionId(active) : undefined}
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : l.search}
      />
      {scopes ? (
        <div className="pal-scopes">
          <Segmented
            options={scopes}
            label={l.scopes}
            value={scope ?? innerScope}
            onChange={(v) => {
              setInnerScope(v);
              onScopeChange?.(v);
            }}
          />
        </div>
      ) : null}
      {filters ? (
        <div className="pal-filters">
          {filters.map((f) => (
            <button key={f} type="button" className="pal-chip" aria-pressed={f === filter} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      ) : null}
      <div className="pal-list" role="listbox" id={listId}>
        {shown.length ? (
          shown.map((s) => (
            <div key={s.title} role="group" aria-label={s.title}>
              <div className="pal-section">{s.title}</div>
              {s.rows.map((r, i) => {
                const idx = n++;
                return (
                  <div
                    key={r.id ?? i}
                    id={optionId(idx)}
                    ref={idx === active ? reveal : undefined}
                    className="pal-row"
                    role="option"
                    aria-selected={idx === active}
                    aria-disabled={r.disabled ? true : undefined}
                    data-row-id={r.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(r)}
                  >
                    {r.leading ? <span className="pal-leading">{r.leading}</span> : null}
                    {r.state ? <StatusDot state={r.state} /> : <Icon name={r.icon ?? "terminal"} className="pal-icon" />}
                    <span className="pal-title-text">{r.label ?? highlight(r.title, q)}</span>
                    {r.detail ? <span className="pal-detail">{r.detail}</span> : null}
                    {r.hint ? <span className="pal-hint">{r.hint}</span> : null}
                    {r.meta ? <span className="pal-meta">{r.meta}</span> : null}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="pal-empty">{emptyText ?? l.noMatches}</div>
        )}
      </div>
      <div className="pal-foot">
        <span>
          <Kbd>↑↓</Kbd> {l.move}
        </span>
        <span>
          <Kbd>Enter</Kbd> {l.open}
        </span>
        <span>
          <Kbd>Esc</Kbd> {l.close}
        </span>
        {footer ? <span className="pal-foot-extra">{footer}</span> : null}
      </div>
    </div>
  );
  if (!framed) return dialog;
  return (
    <div
      className="pal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {dialog}
    </div>
  );
}
