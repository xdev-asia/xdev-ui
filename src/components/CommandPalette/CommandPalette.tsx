import { useId, useState, type JSX, type KeyboardEvent, type ReactNode } from "react";
import type { IconName } from "../../icons";
import type { SessionState } from "../../types";
import { rovingIndex } from "../../internal/keys";
import { Icon } from "../Icon/Icon";
import { Kbd } from "../Kbd/Kbd";
import { StatusDot } from "../StatusDot/StatusDot";

export interface PaletteRow {
  title: string;
  detail?: string;
  state?: SessionState;
  icon?: IconName;
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
}

const DEFAULT_LABELS: CommandPaletteLabels = {
  dialog: "Command palette",
  placeholder: "Search sessions, files, commands",
  search: "Search",
  noMatches: "No matches",
  move: "move",
  open: "open",
  close: "close",
};

export interface CommandPaletteProps {
  title?: string;
  placeholder?: string;
  defaultQuery?: string;
  filters?: string[];
  sections: { title: string; rows: PaletteRow[] }[];
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<CommandPaletteLabels>;
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

export function CommandPalette({ title, placeholder, defaultQuery = "", filters, sections, labels }: CommandPaletteProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [q, setQ] = useState(defaultQuery);
  const [filter, setFilter] = useState<string | null>(filters?.[0] ?? null);
  const needle = q.toLowerCase();
  const shown = sections
    .map((s) => ({ title: s.title, rows: s.rows.filter((r) => !needle || r.title.toLowerCase().includes(needle)) }))
    .filter((s) => s.rows.length > 0);
  const uid = useId();
  const titleId = `${uid}-title`;
  const listId = `${uid}-list`;
  const optionId = (n: number): string => `${uid}-opt-${n}`;
  const count = shown.reduce((n, s) => n + s.rows.length, 0);
  const [at, setAt] = useState(0);
  const active = count ? Math.min(at, count - 1) : -1;
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    const next = rovingIndex(e.key, active, count, "vertical");
    if (next == null) return;
    e.preventDefault();
    setAt(next);
  };
  let n = 0;
  return (
    <div className="palette" role="dialog" aria-label={title ?? l.dialog}>
      {title ? <div className="pal-title" id={titleId}>{title}</div> : null}
      <input
        className="pal-input"
        placeholder={placeholder ?? l.placeholder}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
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
                  <div key={i} id={optionId(idx)} className="pal-row" role="option" aria-selected={idx === active}>
                    {r.state ? <StatusDot state={r.state} /> : <Icon name={r.icon ?? "terminal"} className="pal-icon" />}
                    <span className="pal-title-text">{highlight(r.title, q)}</span>
                    {r.detail ? <span className="pal-detail">{r.detail}</span> : null}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="pal-empty">{l.noMatches}</div>
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
      </div>
    </div>
  );
}
