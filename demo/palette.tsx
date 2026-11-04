import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Kbd } from "../src";
import { COMPONENTS, type Comp } from "./data";

/** Live catalogue search. Native <dialog>: modal focus, Escape and focus return come from the browser. */
export function Palette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  const hits = useMemo<Comp[]>(() => {
    const s = q.trim().toLowerCase();
    if (!s) return COMPONENTS;
    return COMPONENTS.filter((c) => `${c.name} ${c.group} ${c.summary}`.toLowerCase().includes(s));
  }, [q]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      setQ("");
      setActive(0);
      input.current?.focus();
    } else if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => setActive(0), [q]);

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      window.location.href = hits[active].href;
    }
  };

  return (
    <dialog
      ref={ref}
      className="hp-pal"
      aria-label="Search the catalogue"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="hp-pal-box">
        <input
          ref={input}
          className="hp-pal-input"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={hits[active] ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          placeholder="Search components"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
        />
        <ul id={listId} role="listbox" className="hp-pal-list" aria-label="Components">
          {hits.map((c, i) => (
            <li key={c.name} id={`${listId}-${i}`} role="option" aria-selected={i === active} onMouseMove={() => setActive(i)}>
              <a href={c.href} tabIndex={-1}>
                <span className="hp-pal-name">{c.name}</span>
                <span className="hp-pal-sum">{c.summary}</span>
                <span className="hp-pal-group">{c.group}</span>
              </a>
            </li>
          ))}
        </ul>
        {hits.length === 0 && <p className="hp-pal-empty">Nothing matches “{q}”.</p>}
        <p className="hp-pal-foot">
          <Kbd>↑</Kbd> <Kbd>↓</Kbd> move <Kbd>Enter</Kbd> open <Kbd>Esc</Kbd> close
        </p>
      </div>
    </dialog>
  );
}
