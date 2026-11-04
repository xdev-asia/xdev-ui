import { useRef, type JSX, type KeyboardEvent, type PointerEvent } from "react";
import { cx } from "../../internal/cx";
import { clamp, resizeKey } from "../../internal/keys";

export interface SplitHandleLabels {
  /** aria-label of the separator. */
  resize: string;
}

const DEFAULT_LABELS: SplitHandleLabels = { resize: "Resize panel" };

export interface SplitHandleProps {
  /** "horizontal" resizes a width (a vertical bar, Left/Right keys); "vertical" resizes a height (Up/Down). */
  direction: "horizontal" | "vertical";
  /** Current size in px of the panel this handle resizes. */
  value: number;
  min: number;
  max: number;
  /** Called with the new clamped size while dragging and on key presses. */
  onResize: (value: number) => void;
  /** px per arrow key press. Shift multiplies by 4. Default 10. */
  step?: number;
  /** Set when the panel is on the right or bottom of the handle, so moving toward it shrinks it. */
  reverse?: boolean;
  /** Names the panel ("Resize file tree"). Overrides `labels.resize`. */
  label?: string;
  /** Override the English defaults (e.g. for vi). */
  labels?: Partial<SplitHandleLabels>;
  className?: string;
}

export function SplitHandle({
  direction,
  value,
  min,
  max,
  onResize,
  step = 10,
  reverse = false,
  label,
  labels,
  className,
}: SplitHandleProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const axis = direction === "horizontal" ? "x" : "y";
  const drag = useRef<{ start: number; from: number } | null>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const next = resizeKey(e.key, value, { min, max, step, big: e.shiftKey, axis, reverse });
    if (next == null) return;
    e.preventDefault();
    onResize(next);
  };
  const pos = (e: PointerEvent<HTMLDivElement>): number => (axis === "x" ? e.clientX : e.clientY);
  const onPointerDown = (e: PointerEvent<HTMLDivElement>): void => {
    drag.current = { start: pos(e), from: value };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>): void => {
    if (!drag.current) return;
    const delta = pos(e) - drag.current.start;
    onResize(clamp(drag.current.from + (reverse ? -delta : delta), min, max));
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>): void => {
    drag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      className={cx("ws-handle", "x-split-handle", className)}
      role="separator"
      aria-orientation={direction === "horizontal" ? "vertical" : "horizontal"}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={label ?? l.resize}
      tabIndex={0}
      data-direction={direction}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
}
