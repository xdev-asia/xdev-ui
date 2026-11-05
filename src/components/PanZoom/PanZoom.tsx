import { useEffect, useRef, type JSX, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { MAX_ZOOM, MIN_ZOOM, stepZoom, wheelFactor, zoomAt, zoomKey, type PanZoomState } from "../../panZoom";

export interface PanZoomProps {
  /** Scale of the content. */
  zoom: number;
  /** Where the content's top-left corner sits inside the viewport, in px. */
  x: number;
  y: number;
  /** Zoom changed (wheel, keys); `x` and `y` are the pan that keeps the zoom point still. */
  onZoom: (next: PanZoomState) => void;
  /** The `0` key. When given it replaces the default reset to zoom 1 at 0, 0 (a viewer resets to its fit). */
  onReset?: () => void;
  /** The content was dragged. */
  onPan: (x: number, y: number) => void;
  /** Lowest absolute zoom (default 0.25). Pass a value relative to a fit scale when `zoom` 1 is "fit". */
  min?: number;
  /** Highest absolute zoom (default 8). */
  max?: number;
  /** Accessible name of the viewport. */
  label: string;
  children?: ReactNode;
}

/** A viewport that scales and moves its children. The caller owns the state. */
export function PanZoom({ zoom, x, y, onZoom, onPan, onReset, label, min = MIN_ZOOM, max = MAX_ZOOM, children }: PanZoomProps): JSX.Element {
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  // A React `onWheel` is passive, so its `preventDefault()` is ignored and the page zooms too.
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const onWheel = (e: globalThis.WheelEvent): void => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = node.getBoundingClientRect();
      onZoom(zoomAt({ zoom, x, y }, { x: e.clientX - r.left, y: e.clientY - r.top }, wheelFactor(e.deltaY), min, max));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [zoom, x, y, onZoom, min, max]);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const action = zoomKey(e.key);
    if (action === null) return;
    e.preventDefault();
    if (action === "reset") return onReset ? onReset() : onZoom({ zoom: 1, x: 0, y: 0 });
    const r = e.currentTarget.getBoundingClientRect();
    const next = stepZoom(zoom, action === "in" ? 1 : -1, undefined, min, max);
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
      ref={root}
      className="x-panzoom"
      role="group"
      aria-label={label}
      tabIndex={0}
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
