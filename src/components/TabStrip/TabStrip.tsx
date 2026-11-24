import { useId, useState, type CSSProperties, type DragEvent, type JSX, type KeyboardEvent } from "react";
import type { IconName } from "../../icons";
import { Icon } from "../Icon/Icon";
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
  /** Cannot be closed: no close button and Delete does nothing (a home page tab). Also cannot be moved. */
  pinned?: boolean;
  /** Glyph before the name, e.g. the page's menu icon. */
  icon?: IconName;
}

/** Look of the strip: `chrome` (default) joined tabs, `card` separate boxes, `plain` text with an underline, `brisk` a soft pill. */
export type TabStripVariant = "chrome" | "card" | "plain" | "brisk";

/** Pure: `ids` with `id` moved to `to` (an index in the list after removal); pinned ids never move and nothing passes them. */
export function moveTab(ids: readonly string[], id: string, to: number, pinned: ReadonlySet<string> = new Set()): string[] {
  const from = ids.indexOf(id);
  if (from < 0 || pinned.has(id)) return [...ids];
  const rest = ids.filter((x) => x !== id);
  const floor = rest.filter((x) => pinned.has(x)).length;
  const at = Math.max(floor, Math.min(to, rest.length));
  rest.splice(at, 0, id);
  return rest;
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
  variant?: TabStripVariant;
  /** Lets people drag tabs, or press Shift+Left/Right on one, to reorder; gets every id in the new order. */
  onReorder?: (ids: string[]) => void;
}

export function TabStrip({ tabs, selected, defaultSelected, onSelect, onClose, onAdd, label, labels, variant, onReorder }: TabStripProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [inner, setInner] = useState(defaultSelected ?? tabs[0]?.id);
  const current = selected ?? inner;
  const uid = useId();
  const tabId = (id: string): string => `${uid}-${id}`;
  const stop = tabs.some((t) => t.id === current) ? current : tabs[0]?.id;
  const ids = tabs.map((t) => t.id);
  const pinned = new Set(tabs.filter((t) => t.pinned).map((t) => t.id));
  // State, not a ref: the component stays callable as a plain function in tests.
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, t: TabItem): void => {
    const list = Array.from(e.currentTarget.closest(".ws-tabstrip")?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []);
    const at = list.indexOf(e.currentTarget);
    if (onReorder && e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault();
      const next = moveTab(ids, t.id, at + (e.key === "ArrowLeft" ? -1 : 1), pinned);
      if (next.join("\n") !== ids.join("\n")) onReorder(next);
      return;
    }
    if (e.key === "Delete") {
      if (!onClose || t.dirty || t.pinned) return;
      e.preventDefault();
      list[at + 1 < list.length ? at + 1 : at - 1]?.focus();
      onClose(t.id);
      return;
    }
    const next = rovingIndex(e.key, at, list.length);
    if (next == null) return;
    e.preventDefault();
    list[next]?.focus();
    list[next]?.click();
  };
  return (
    <div className="ws-tabstrip" data-variant={variant && variant !== "chrome" ? variant : undefined}>
      {/* Close buttons sit beside the tabs, so the tablist owns the tab buttons by id instead of containing them. */}
      <div className="ws-tabstrip-list" role="tablist" aria-label={label} aria-owns={tabs.map((t) => tabId(t.id)).join(" ") || undefined} />
      {tabs.map((t) => {
        const style = t.color ? ({ "--ws-tab-color": `var(--x-tab-color-${t.color})` } as CSSProperties) : undefined;
        const isSel = t.id === current;
        const movable = !!onReorder && !t.pinned;
        const drag = onReorder
          ? {
              draggable: movable,
              onDragStart: (e: DragEvent<HTMLDivElement>) => {
                if (!movable) return;
                setDragging(t.id);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", t.name);
              },
              onDragOver: (e: DragEvent<HTMLDivElement>) => {
                if (!dragging || t.pinned) return;
                e.preventDefault();
                setOver(t.id);
              },
              onDragLeave: () => setOver((o) => (o === t.id ? null : o)),
              onDrop: (e: DragEvent<HTMLDivElement>) => {
                const id = dragging;
                setDragging(null);
                setOver(null);
                if (!id || id === t.id || t.pinned) return;
                e.preventDefault();
                onReorder(moveTab(ids, id, ids.indexOf(t.id), pinned));
              },
              onDragEnd: () => {
                setDragging(null);
                setOver(null);
              },
            }
          : {};
        return (
          <div
            key={t.id}
            className="ws-tab"
            role="presentation"
            {...drag}
            data-drop={over === t.id ? "" : undefined}
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
              {t.icon ? <Icon name={t.icon} size={14} /> : null}
              <span className="ws-tab-name">{t.name}</span>
              {t.skipped ? <span className="ws-tab-skip">{l.skipped}</span> : null}
            </button>
            {t.pinned ? null : t.dirty ? (
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
