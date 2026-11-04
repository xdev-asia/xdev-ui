import { useState, type JSX, type ReactNode } from "react";
import type { IconName } from "../../icons";
import type { SessionState } from "../../types";
import { Icon } from "../Icon/Icon";
import { Kbd } from "../Kbd/Kbd";
import { StatusDot } from "../StatusDot/StatusDot";

export interface PaletteRow {
  title: string;
  detail?: string;
  state?: SessionState;
  icon?: IconName;
}

export interface CommandPaletteProps {
  title?: string;
  placeholder?: string;
  defaultQuery?: string;
  filters?: string[];
  sections: { title: string; rows: PaletteRow[] }[];
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

export function CommandPalette({ title, placeholder, defaultQuery = "", filters, sections }: CommandPaletteProps): JSX.Element {
  const [q, setQ] = useState(defaultQuery);
  const [filter, setFilter] = useState<string | null>(filters?.[0] ?? null);
  const needle = q.toLowerCase();
  const shown = sections
    .map((s) => ({ title: s.title, rows: s.rows.filter((r) => !needle || r.title.toLowerCase().includes(needle)) }))
    .filter((s) => s.rows.length > 0);
  let first = true;
  return (
    <div className="palette" role="dialog" aria-label={title ?? "Command palette"}>
      {title ? <div className="pal-title">{title}</div> : null}
      <input
        className="pal-input"
        placeholder={placeholder ?? "Search sessions, files, commands"}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label={placeholder ?? "Search"}
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
      <div className="pal-list" role="listbox">
        {shown.length ? (
          shown.map((s) => (
            <div key={s.title} role="group" aria-label={s.title}>
              <div className="pal-section">{s.title}</div>
              {s.rows.map((r, i) => {
                const sel = first;
                first = false;
                return (
                  <div key={i} className="pal-row" role="option" aria-selected={sel}>
                    {r.state ? <StatusDot state={r.state} /> : <Icon name={r.icon ?? "terminal"} className="pal-icon" />}
                    <span className="pal-title-text">{highlight(r.title, q)}</span>
                    {r.detail ? <span className="pal-detail">{r.detail}</span> : null}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="pal-empty">No matches</div>
        )}
      </div>
      <div className="pal-foot">
        <span>
          <Kbd>↑↓</Kbd> move
        </span>
        <span>
          <Kbd>Enter</Kbd> open
        </span>
        <span>
          <Kbd>Esc</Kbd> close
        </span>
      </div>
    </div>
  );
}
