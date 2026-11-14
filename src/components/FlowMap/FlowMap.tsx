import { useCallback, useEffect, useRef, useState, type CSSProperties, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { fitScale, stepZoom, zoomAt, type PanZoomState } from "../../panZoom";
import { Emblem } from "../Emblem/Emblem";
import { IconButton } from "../IconButton/IconButton";
import { PanZoom } from "../PanZoom/PanZoom";

/** Size of a node and of the hub in the map, in px at zoom 1. The stylesheet reads them from the root. */
export const FLOW_NODE = { w: 208, h: 56 } as const;
export const FLOW_HUB = { w: 240, h: 64 } as const;
const PAD = 48;
const GRID = 24;
/** Fit never enlarges past this, so one node does not fill the panel. */
const FIT_MAX = 1.5;
const MIN = 0.1;
const MAX = 4;

export interface FlowMapNode {
  id: string;
  name: string;
  /** Logo URL, as in `Emblem`. */
  src?: string | null;
  /** The thing's own colour and letters, as in `Emblem`. */
  color?: string | null;
  text?: string;
  /** A short line under the name ("12 requests"). The state is said here, not only by the edge colour. */
  detail?: string;
  /** Traffic went through this edge: the edge is drawn in the accent and moves. */
  active?: boolean;
}

export interface FlowMapLabels {
  zoomIn: string;
  zoomOut: string;
  fit: string;
  /** aria-label of the controls group. */
  controls: string;
}

const DEFAULT_LABELS: FlowMapLabels = { zoomIn: "Zoom in", zoomOut: "Zoom out", fit: "Fit to view", controls: "Zoom" };

export interface FlowMapProps {
  /** The centre every node connects to. `mark` replaces the default letters (a `BrandMark`, an `Emblem`). */
  hub: { name: string; mark?: ReactNode; detail?: string };
  nodes: FlowMapNode[];
  /** Accessible name of the map. */
  label: string;
  labels?: Partial<FlowMapLabels>;
  className?: string;
}

/**
 * Where each of `count` nodes sits around the hub at 0, 0, in px. One node sits straight above it; more go round an
 * ellipse from the top, clockwise, sized so no two boxes (and no box and the hub) come closer than 16 px.
 */
export function flowMapLayout(count: number): Array<{ x: number; y: number }> {
  if (count <= 0) return [];
  // Even angles on an ellipse: two neighbours are rx·Δθ apart at the top and ry·Δθ at the sides, and only ~0.7 of each
  // at 45°, hence the 1.45. The minimums keep the hub clear when there are few nodes.
  const step = (2 * Math.PI) / count;
  const rx = Math.max(FLOW_NODE.w / 2 + FLOW_HUB.w / 2 + 48, (1.45 * (FLOW_NODE.w + 24)) / step);
  const ry = Math.max(FLOW_NODE.h + FLOW_HUB.h + 48, (1.45 * (FLOW_NODE.h + 24)) / step);
  return Array.from({ length: count }, (_, i) => {
    const a = -Math.PI / 2 + i * step;
    return { x: Math.abs(Math.cos(a)) < 1e-9 ? 0 : rx * Math.cos(a), y: ry * Math.sin(a) };
  });
}

function bounds(points: Array<{ x: number; y: number }>) {
  let minX = -FLOW_HUB.w / 2, maxX = FLOW_HUB.w / 2, minY = -FLOW_HUB.h / 2, maxY = FLOW_HUB.h / 2;
  for (const p of points) {
    minX = Math.min(minX, p.x - FLOW_NODE.w / 2);
    maxX = Math.max(maxX, p.x + FLOW_NODE.w / 2);
    minY = Math.min(minY, p.y - FLOW_NODE.h / 2);
    maxY = Math.max(maxY, p.y + FLOW_NODE.h / 2);
  }
  return { left: minX - PAD, top: minY - PAD, w: maxX - minX + PAD * 2, h: maxY - minY + PAD * 2 };
}

/** A hub and the things connected to it, on a grid you can pan and zoom (9router's usage topology). */
export function FlowMap({ hub, nodes, label, labels, className }: FlowMapProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const points = flowMapLayout(nodes.length);
  const world = bounds(points);
  const root = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [view, setView] = useState<PanZoomState | null>(null);
  /** True until the user zooms or pans: a resize or a new node then fits again. */
  const [auto, setAuto] = useState(true);

  const fit = useCallback((): PanZoomState | null => {
    if (!box) return null;
    const zoom = Math.min(FIT_MAX, fitScale({ w: world.w, h: world.h }, box, { padding: 0, upscale: true }));
    return { zoom, x: (box.w - world.w * zoom) / 2, y: (box.h - world.h * zoom) / 2 };
  }, [box, world.w, world.h]);

  useEffect(() => {
    const node = root.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(node);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    if (auto) setView(fit());
  }, [auto, fit]);

  const current = view ?? { zoom: 1, x: 0, y: 0 };
  const change = (next: PanZoomState): void => {
    setAuto(false);
    setView(next);
  };
  const step = (dir: 1 | -1): void => {
    if (!box) return;
    const next = stepZoom(current.zoom, dir, undefined, MIN, MAX);
    change(zoomAt(current, { x: box.w / 2, y: box.h / 2 }, next / current.zoom, MIN, MAX));
  };
  const refit = (): void => {
    setAuto(true);
    setView(fit());
  };

  const at = (p: { x: number; y: number }) => ({ left: p.x - world.left, top: p.y - world.top });
  const centre = at({ x: 0, y: 0 });
  const style = {
    "--x-flowmap-node-w": `${FLOW_NODE.w}px`,
    "--x-flowmap-node-h": `${FLOW_NODE.h}px`,
    "--x-flowmap-hub-w": `${FLOW_HUB.w}px`,
    "--x-flowmap-hub-h": `${FLOW_HUB.h}px`,
    "--x-flowmap-grid": `${GRID * current.zoom}px`,
    "--x-flowmap-grid-x": `${current.x}px`,
    "--x-flowmap-grid-y": `${current.y}px`,
  } as CSSProperties;

  return (
    <div ref={root} className={cx("x-flowmap", className)} data-ready={view ? "" : undefined} style={style}>
      <PanZoom
        zoom={current.zoom}
        x={current.x}
        y={current.y}
        min={MIN}
        max={MAX}
        label={label}
        onZoom={change}
        onPan={(x, y) => change({ ...current, x, y })}
        onReset={refit}
      >
        <div className="x-flowmap-world" style={{ width: world.w, height: world.h }}>
          <svg className="x-flowmap-edges" width={world.w} height={world.h} aria-hidden="true">
            {points.map((p, i) => {
              const end = at(p);
              return (
                <line
                  key={nodes[i].id}
                  className="x-flowmap-edge"
                  data-active={nodes[i].active ? "" : undefined}
                  x1={centre.left}
                  y1={centre.top}
                  x2={end.left}
                  y2={end.top}
                />
              );
            })}
          </svg>
          {nodes.length > 0 && (
          <ul className="x-flowmap-nodes">
            {nodes.map((n, i) => (
              <li key={n.id} className="x-flowmap-node" data-active={n.active ? "" : undefined} style={at(points[i])}>
                <Emblem name={n.name} src={n.src} color={n.color} text={n.text} size="sm" />
                <span className="x-flowmap-text">
                  <span className="x-flowmap-name">{n.name}</span>
                  {n.detail && <span className="x-flowmap-detail">{n.detail}</span>}
                </span>
              </li>
            ))}
          </ul>
          )}
          <div className="x-flowmap-node x-flowmap-hub" style={centre}>
            {hub.mark ?? <Emblem name={hub.name} size="sm" />}
            <span className="x-flowmap-text">
              <span className="x-flowmap-name">{hub.name}</span>
              {hub.detail && <span className="x-flowmap-detail">{hub.detail}</span>}
            </span>
          </div>
        </div>
      </PanZoom>
      <div className="x-flowmap-controls" role="group" aria-label={l.controls}>
        <IconButton icon="plus" size="sm" label={l.zoomIn} onClick={() => step(1)} />
        <IconButton icon="minus" size="sm" label={l.zoomOut} onClick={() => step(-1)} />
        <IconButton icon="maximize" size="sm" label={l.fit} onClick={refit} />
      </div>
    </div>
  );
}
