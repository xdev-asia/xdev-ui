import { useId, useState, type CSSProperties, type JSX, type KeyboardEvent } from "react";
import { rovingIndex } from "../../internal/keys";
import type { AgentProfile, SessionState, TabColor } from "../../types";
import { AgentChip } from "../AgentChip/AgentChip";
import { StatusDot } from "../StatusDot/StatusDot";

export interface TabItem {
  id: string;
  name: string;
  state?: SessionState;
  profile?: AgentProfile;
  color?: TabColor;
  unread?: boolean;
  dirty?: boolean;
  skipped?: boolean;
}

export interface TabStripLabels {
  skipped: string;
  unsaved: string;
  newTab: string;
  /** aria-label of a tab close button. */
  close: (name: string) => string;
}

const DEFAULT_LABELS: TabStripLabels = {
  skipped: "skipped",
  unsaved: "Unsaved",
  newTab: "New tab",
  close: (name) => `Close ${name}`,
};

export interface TabStripProps {
  tabs: TabItem[];
  selected?: string;
  defaultSelected?: string;
  onSelect?: (id: string) => void;
  onClose?: (id: string) => void;
  /** false hides the + button. */
  onAdd?: (() => void) | false;
  label?: string;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<TabStripLabels>;
}

export function TabStrip({ tabs, selected, defaultSelected, onSelect, onClose, onAdd, label, labels }: TabStripProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [inner, setInner] = useState(defaultSelected ?? tabs[0]?.id);
  const current = selected ?? inner;
  const uid = useId();
  const tabId = (id: string): string => `${uid}-${id}`;
  const stop = tabs.some((t) => t.id === current) ? current : tabs[0]?.id;
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, t: TabItem): void => {
    const list = Array.from(e.currentTarget.closest(".ws-tabstrip")?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []);
    const at = list.indexOf(e.currentTarget);
    if (e.key === "Delete") {
      if (!onClose || t.dirty) return;
      e.preventDefault();
      list[at + 1 < list.length ? at + 1 : at - 1]?.focus();
      onClose(t.id);
      return;
    }
    const next = rovingIndex(e.key, at, list.length);
    if (next == null) return;
    e.preventDefault();
    list[next].focus();
    list[next].click();
  };
  return (
    <div className="ws-tabstrip">
      {/* Close buttons sit beside the tabs, so the tablist owns the tab buttons by id instead of containing them. */}
      <div className="ws-tabstrip-list" role="tablist" aria-label={label} aria-owns={tabs.map((t) => tabId(t.id)).join(" ") || undefined} />
      {tabs.map((t) => {
        const style = t.color ? ({ "--ws-tab-color": `var(--x-tab-color-${t.color})` } as CSSProperties) : undefined;
        const isSel = t.id === current;
        return (
          <div
            key={t.id}
            className="ws-tab"
            role="presentation"
            data-selected={isSel ? "" : undefined}
            data-color={t.color || undefined}
            data-unread={t.unread ? "" : undefined}
            style={style}
          >
            <button
              type="button"
              className="ws-tab-main"
              id={tabId(t.id)}
              role="tab"
              aria-selected={isSel}
              tabIndex={t.id === stop ? 0 : -1}
              onKeyDown={(e) => onKeyDown(e, t)}
              onClick={() => {
                setInner(t.id);
                onSelect?.(t.id);
              }}
            >
              {t.state ? <StatusDot state={t.state} pulse={t.state === "working"} /> : null}
              {t.profile ? <AgentChip profile={t.profile} /> : null}
              <span className="ws-tab-name">{t.name}</span>
              {t.skipped ? <span className="ws-tab-skip">{l.skipped}</span> : null}
            </button>
            {t.dirty ? (
              <span className="ws-tab-dirty" aria-label={l.unsaved} />
            ) : (
              <button type="button" className="ws-tab-close" aria-label={l.close(t.name)} tabIndex={-1} onClick={() => onClose?.(t.id)}>
                ×
              </button>
            )}
          </div>
        );
      })}
      {onAdd !== false ? (
        <button type="button" className="ws-tab-add" aria-label={l.newTab} onClick={onAdd || undefined}>
          +
        </button>
      ) : null}
    </div>
  );
}
