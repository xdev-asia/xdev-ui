import { useRef, type JSX, type KeyboardEvent, type PointerEvent, type ReactNode, type WheelEvent } from "react";
import { stepZoom, wheelFactor, zoomAt, zoomKey, type PanZoomState } from "../../panZoom";

export interface PanZoomProps {
  /** Scale of the content. */
  zoom: number;
  /** Where the content's top-left corner sits inside the viewport, in px. */
  x: number;
  y: number;
  /** Zoom changed (wheel, keys); `x` and `y` are the pan that keeps the zoom point still. */
  onZoom: (next: PanZoomState) => void;
  /** The content was dragged. */
  onPan: (x: number, y: number) => void;
  /** Accessible name of the viewport. */
  label: string;
  children?: ReactNode;
}

/** A viewport that scales and moves its children. The caller owns the state. */
export function PanZoom({ zoom, x, y, onZoom, onPan, label, children }: PanZoomProps): JSX.Element {
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const onWheel = (e: WheelEvent<HTMLDivElement>): void => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    onZoom(zoomAt({ zoom, x, y }, { x: e.clientX - r.left, y: e.clientY - r.top }, wheelFactor(e.deltaY)));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const action = zoomKey(e.key);
    if (action === null) return;
    e.preventDefault();
    if (action === "reset") return onZoom({ zoom: 1, x: 0, y: 0 });
    const r = e.currentTarget.getBoundingClientRect();
    const next = stepZoom(zoom, action === "in" ? 1 : -1);
    onZoom(zoomAt({ zoom, x, y }, { x: r.width / 2, y: r.height / 2 }, next / zoom));
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>): void => {
    if (e.button !== 0) return;
    drag.current = { px: e.clientX, py: e.clientY, x, y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>): void => {
    const d = drag.current;
    if (d) onPan(d.x + e.clientX - d.px, d.y + e.clientY - d.py);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>): void => {
    drag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };
  return (
    <div
      className="x-panzoom"
      role="group"
      aria-label={label}
      tabIndex={0}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="x-panzoom-content" style={{ transform: `translate(${x}px, ${y}px) scale(${zoom})` }}>
        {children}
      </div>
    </div>
  );
}
