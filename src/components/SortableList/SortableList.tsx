import { useEffect, useRef, useState, type JSX, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { moveItem, reorderKeyStep, reorderSlot, slotToIndex, type ReorderKeyState } from "../DataTable/table-reorder";
import { Icon } from "../Icon/Icon";

export interface SortableListLabels {
  /** Accessible name of an item's grip handle. */
  handle: (itemLabel: string) => string;
  /** Announced when an item is lifted with Space or Enter. */
  lifted: (itemLabel: string) => string;
  /** Announced after each arrow key move; `pos` is 1-based. */
  moved: (pos: number, total: number) => string;
  /** Announced when the item is dropped; `pos` is 1-based. */
  dropped: (pos: number, total: number) => string;
  /** Announced when Escape puts the item back. */
  cancelled: string;
}

const DEFAULT_LABELS: SortableListLabels = {
  handle: (name) => `Drag to reorder: ${name}`,
  lifted: (name) => `${name} lifted. Use the up and down arrow keys to move it, Space to drop it, Escape to cancel.`,
  moved: (pos, total) => `Moved to position ${pos} of ${total}.`,
  dropped: (pos, total) => `Dropped at position ${pos} of ${total}.`,
  cancelled: "Reorder cancelled. The item is back in its place.",
};

export interface SortableListProps<T> {
  items: readonly T[];
  getKey: (item: T) => string;
  /** Name of an item in the handle label and announcements. Default: its key. */
  getLabel?: (item: T) => string;
  /** Row content. Place `handle` (the grip button) where it belongs in the row. */
  renderItem: (item: T, index: number, handle: ReactNode) => ReactNode;
  /** Called once per finished move. The list is controlled: apply it (e.g. with `moveItem`). */
  onReorder?: (from: number, to: number) => void;
  disabled?: boolean;
  /** aria-label of the list. */
  label?: string;
  labels?: Partial<SortableListLabels>;
  className?: string;
}

/** A vertical list reordered by dragging a grip handle, or with the keyboard (Space, arrows, Space/Escape). */
export function SortableList<T>({ items, getKey, getLabel, renderItem, onReorder, disabled, label, labels, className }: SortableListProps<T>): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [liftState, setLift] = useState<ReorderKeyState>(null);
  const [drag, setDrag] = useState<{ from: number; slot: number } | null>(null);
  const [message, setMessage] = useState("");
  const mids = useRef<number[]>([]);
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const total = items.length;
  const off = Boolean(disabled) || total < 2;
  // A lift is dropped silently if the items change under it.
  const lift = liftState && liftState.from < total && liftState.at < total && !off ? liftState : null;
  const shown = lift ? moveItem(items, lift.from, lift.at) : items;
  const liftedKey = lift ? getKey(items[lift.from]) : null;
  const nameOf = (item: T): string => (getLabel ? getLabel(item) : getKey(item));

  // Moving an item moves its DOM node, which can drop focus; put it back on the lifted handle.
  useEffect(() => {
    if (liftedKey != null) handles.current.get(liftedKey)?.focus();
  }, [liftedKey, lift?.at]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    if (off) return;
    const step = reorderKeyStep(lift, e.key, index, total);
    if (!step.handled) return;
    e.preventDefault();
    setLift(step.state);
    const ev = step.event;
    if (!ev) return;
    if (ev.type === "lift") setMessage(l.lifted(nameOf(items[ev.from])));
    else if (ev.type === "move") setMessage(l.moved(ev.to + 1, total));
    else if (ev.type === "drop") {
      setMessage(l.dropped(ev.to + 1, total));
      if (ev.to !== ev.from) onReorder?.(ev.from, ev.to);
    } else setMessage(l.cancelled);
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>, index: number): void => {
    if (off || lift || e.button !== 0) return;
    const list = e.currentTarget.closest("ul");
    if (!list) return;
    mids.current = Array.from(list.children).map((r) => {
      const b = r.getBoundingClientRect();
      return b.top + b.height / 2;
    });
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.preventDefault();
    setDrag({ from: index, slot: index });
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>): void => {
    if (!drag) return;
    const slot = reorderSlot(e.clientY, mids.current);
    if (slot !== drag.slot) setDrag({ from: drag.from, slot });
  };
  const onPointerUp = (): void => {
    if (!drag) return;
    const to = slotToIndex(drag.from, drag.slot);
    setDrag(null);
    if (to === drag.from) return;
    setMessage(l.dropped(to + 1, total));
    onReorder?.(drag.from, to);
  };

  const dragTo = drag ? slotToIndex(drag.from, drag.slot) : null;
  const dropMark = (index: number): string | undefined => {
    if (!drag || dragTo === drag.from) return undefined;
    if (drag.slot < total) return index === drag.slot ? "before" : undefined;
    return index === total - 1 ? "after" : undefined;
  };

  return (
    <>
      <ul className={cx("x-sortable", className)} aria-label={label}>
        {shown.map((item, index) => {
          const k = getKey(item);
          const handle = (
            <button
              type="button"
              className="x-sortable-handle"
              ref={(el) => {
                if (el) handles.current.set(k, el);
                else handles.current.delete(k);
              }}
              aria-label={l.handle(nameOf(item))}
              disabled={off}
              onKeyDown={(e) => onKeyDown(e, index)}
              onBlur={(e) => {
                if (lift && e.relatedTarget) {
                  setLift(null);
                  setMessage(l.cancelled);
                }
              }}
              onPointerDown={(e) => onPointerDown(e, index)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => setDrag(null)}
            >
              <Icon name="grip" size={16} />
            </button>
          );
          return (
            <li
              key={k}
              className="x-sortable-item"
              data-lifted={lift && k === liftedKey ? "" : undefined}
              data-dragging={drag && index === drag.from ? "" : undefined}
              data-drop={dropMark(index)}
            >
              {renderItem(item, index, handle)}
            </li>
          );
        })}
      </ul>
      <div className="x-sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </>
  );
}
