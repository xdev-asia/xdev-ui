import { useState, type CSSProperties, type JSX } from "react";
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

export interface TabStripProps {
  tabs: TabItem[];
  selected?: string;
  defaultSelected?: string;
  onSelect?: (id: string) => void;
  onClose?: (id: string) => void;
  /** false hides the + button. */
  onAdd?: (() => void) | false;
  label?: string;
}

export function TabStrip({ tabs, selected, defaultSelected, onSelect, onClose, onAdd, label }: TabStripProps): JSX.Element {
  const [inner, setInner] = useState(defaultSelected ?? tabs[0]?.id);
  const current = selected ?? inner;
  return (
    <div className="ws-tabstrip" role="tablist" aria-label={label}>
      {tabs.map((t) => {
        const style = t.color ? ({ "--ws-tab-color": `var(--x-tab-color-${t.color})` } as CSSProperties) : undefined;
        const isSel = t.id === current;
        return (
          <div
            key={t.id}
            className="ws-tab"
            role="presentation"
            aria-selected={isSel}
            data-color={t.color || undefined}
            data-unread={t.unread ? "" : undefined}
            style={style}
          >
            <button
              type="button"
              className="ws-tab-main"
              role="tab"
              aria-selected={isSel}
              onClick={() => {
                setInner(t.id);
                onSelect?.(t.id);
              }}
            >
              {t.state ? <StatusDot state={t.state} pulse={t.state === "working"} /> : null}
              {t.profile ? <AgentChip profile={t.profile} /> : null}
              <span className="ws-tab-name">{t.name}</span>
              {t.skipped ? <span className="ws-tab-skip">skipped</span> : null}
            </button>
            {t.dirty ? (
              <span className="ws-tab-dirty" aria-label="Unsaved" />
            ) : (
              <button type="button" className="ws-tab-close" aria-label={`Close ${t.name}`} onClick={() => onClose?.(t.id)}>
                ×
              </button>
            )}
          </div>
        );
      })}
      {onAdd !== false ? (
        <button type="button" className="ws-tab-add" aria-label="New tab" onClick={onAdd || undefined}>
          +
        </button>
      ) : null}
    </div>
  );
}
