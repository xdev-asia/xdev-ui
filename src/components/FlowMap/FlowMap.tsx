import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { fitScale, stepZoom, zoomAt, type PanZoomState } from "../../panZoom";
import { Emblem } from "../Emblem/Emblem";
import { IconButton } from "../IconButton/IconButton";
import { PanZoom } from "../PanZoom/PanZoom";

/** Size of a node and of the hub in the map, in px at zoom 1. The stylesheet reads them from the root. */
export const FLOW_NODE = { w: 220, h: 64 } as const;
export const FLOW_HUB = { w: 272, h: 80 } as const;
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
  /** Traffic went through this edge: the edge is drawn in colour and moves. */
  active?: boolean;
  /** This node's share of the traffic, 0 to 1: its edge grows from 1.5px to 5px and carries more, faster packets. */
  weight?: number;
  /** Failures: the node's border and edge turn amber or red. Say the same in `detail` ("3 failed"). */
  tone?: "warn" | "danger";
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
  /** Where traffic goes (providers). Round the hub, or in a column on its right when there are `sources`. */
  nodes: FlowMapNode[];
  /** What sends traffic in (callers, apps). Given, the map reads left to right: sources, hub, nodes, on curved edges. */
  sources?: FlowMapNode[];
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

/** Room between the hub and a column, for the curves. */
const SIDE_GAP = 120;
const ROW_GAP = 20;

/**
 * Where `left` sources and `right` nodes sit in the left-to-right map, hub at 0, 0: one column each side, every
 * column centred on the hub, rows 20 px apart.
 */
export function flowMapSides(left: number, right: number): { left: Array<{ x: number; y: number }>; right: Array<{ x: number; y: number }> } {
  const x = FLOW_HUB.w / 2 + SIDE_GAP + FLOW_NODE.w / 2;
  const column = (count: number, at: number) =>
    Array.from({ length: count }, (_, i) => ({ x: at, y: (i - (count - 1) / 2) * (FLOW_NODE.h + ROW_GAP) }));
  return { left: column(left, -x), right: column(right, x) };
}

/** Where the k-th of n edges meets the side of the hub: spread over its middle half so the curves fan out. */
const hubY = (k: number, n: number) => (n <= 1 ? 0 : (k / (n - 1) - 0.5) * (FLOW_HUB.h / 2));

/** A horizontal S-curve from one point to another. */
const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2;
  return `M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
};

const clamp01 = (n: number | undefined) => Math.min(1, Math.max(0, n ?? 0));

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

/** Packets on an edge: one to three by weight, the heavier the faster, spread evenly along it. */
function packets(weight: number): { dur: number; begins: number[] } {
  const count = 1 + Math.round(weight * 2);
  const dur = Math.round((2.6 - weight * 1.2) * 100) / 100;
  return { dur, begins: Array.from({ length: count }, (_, k) => -Math.round(((dur * k) / count) * 100) / 100) };
}

/**
 * One edge: a quiet track always; when it carried traffic, a soft glow, the line in colour (width from the node's
 * weight) and packets running along it from the sender to the receiver.
 */
function Edge({ node, side, d }: { node: FlowMapNode; side?: "in" | "out"; d: string }): JSX.Element {
  const id = `x-flowmap-${useId().replace(/[^\w-]/g, "")}`;
  const weight = clamp01(node.weight);
  const style = { "--x-flowmap-weight": weight } as CSSProperties;
  const run = packets(weight);
  return (
    <g data-side={side} data-tone={node.tone}>
      <path className="x-flowmap-track" d={d} />
      {node.active && <path className="x-flowmap-glow" d={d} style={style} />}
      <path id={id} className="x-flowmap-edge" data-active={node.active ? "" : undefined} d={d} style={style} />
      {node.active &&
        run.begins.map((begin) => (
          <circle key={begin} className="x-flowmap-packet" r={2.5 + weight * 1.5}>
            <animateMotion dur={`${run.dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="linear">
              <mpath href={`#${id}`} />
            </animateMotion>
          </circle>
        ))}
    </g>
  );
}

function Node({ node: n, style }: { node: FlowMapNode; style: CSSProperties }): JSX.Element {
  return (
    <li className="x-flowmap-node" data-active={n.active ? "" : undefined} data-tone={n.tone} style={style}>
      <Emblem name={n.name} src={n.src} color={n.color} text={n.text} size="md" />
      <span className="x-flowmap-text">
        <span className="x-flowmap-name">{n.name}</span>
        {n.detail && <span className="x-flowmap-detail">{n.detail}</span>}
      </span>
    </li>
  );
}

/** A hub and the things connected to it, on a grid you can pan and zoom (9router's usage topology). */
export function FlowMap({ hub, nodes, sources = [], label, labels, className }: FlowMapProps): JSX.Element {
  const l = { ...DEFAULT_LABELS, ...labels };
  const sides = sources.length > 0;
  const placed = sides ? flowMapSides(sources.length, nodes.length) : { left: [], right: flowMapLayout(nodes.length) };
  const points = placed.right;
  const world = bounds([...placed.left, ...points]);
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
            {sources.map((n, i) => {
              const from = at(placed.left[i]);
              const d = curve(from.left + FLOW_NODE.w / 2, from.top, centre.left - FLOW_HUB.w / 2, centre.top + hubY(i, sources.length));
              return <Edge key={`in-${n.id}`} node={n} side="in" d={d} />;
            })}
            {points.map((p, i) => {
              const end = at(p);
              const d = sides
                ? curve(centre.left + FLOW_HUB.w / 2, centre.top + hubY(i, nodes.length), end.left - FLOW_NODE.w / 2, end.top)
                : `M${centre.left} ${centre.top}L${end.left} ${end.top}`;
              return <Edge key={nodes[i].id} node={nodes[i]} side={sides ? "out" : undefined} d={d} />;
            })}
          </svg>
          {sources.length > 0 && (
            <ul className="x-flowmap-nodes" data-side="in">
              {sources.map((n, i) => (
                <Node key={n.id} node={n} style={at(placed.left[i])} />
              ))}
            </ul>
          )}
          {nodes.length > 0 && (
            <ul className="x-flowmap-nodes" data-side={sides ? "out" : undefined}>
              {nodes.map((n, i) => (
                <Node key={n.id} node={n} style={at(points[i])} />
              ))}
            </ul>
          )}
          <div className="x-flowmap-node x-flowmap-hub" style={centre}>
            {hub.mark ?? <Emblem name={hub.name} size="lg" />}
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
