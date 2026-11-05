import type { JSX } from "react";
import { cx } from "../../internal/cx";
import { laneLinks, type GraphRow, type LaneColor } from "./graphLanes";

/** Height of one row. */
export const GRAPH_ROW_HEIGHT = 24;
/** Width of one lane. */
export const GRAPH_LANE_WIDTH = 11;
const RADIUS = 5;
const NODE_Y = GRAPH_ROW_HEIGHT / 2;

export interface CommitGraphProps {
  row: GraphRow;
  className?: string;
}

/** Width in px of a row whose lanes number `input` above and `output` below the node. */
export function graphWidth(input: number, output: number): number {
  return GRAPH_LANE_WIDTH * (Math.max(input, output, 1) + 1);
}

export function laneVar(color: LaneColor): string {
  if (typeof color === "number") return `var(--x-graph-lane-${(color % 5) + 1})`;
  return `var(--x-graph-${color})`;
}

const x = (lane: number): number => GRAPH_LANE_WIDTH * (lane + 1);

/** Quarter-circle elbow from a vertical lane at `from` into a horizontal run at the node. */
function toNode(from: number, node: number): string {
  const dir = Math.sign(node - from);
  return `M ${from} 0 V ${NODE_Y - RADIUS} Q ${from} ${NODE_Y} ${from + dir * RADIUS} ${NODE_Y} H ${node}`;
}

function fromNode(node: number, to: number): string {
  const dir = Math.sign(to - node);
  return `M ${node} ${NODE_Y} H ${to - dir * RADIUS} Q ${to} ${NODE_Y} ${to} ${NODE_Y + RADIUS} V ${GRAPH_ROW_HEIGHT}`;
}

function shift(from: number, to: number): string {
  const dir = Math.sign(to - from);
  return (
    `M ${from} 0 V ${NODE_Y - RADIUS} Q ${from} ${NODE_Y} ${from + dir * RADIUS} ${NODE_Y} ` +
    `H ${to - dir * RADIUS} Q ${to} ${NODE_Y} ${to} ${NODE_Y + RADIUS} V ${GRAPH_ROW_HEIGHT}`
  );
}

/** One row of the commit graph: the lanes passing through and the commit node. */
export function CommitGraph({ row, className }: CommitGraphProps): JSX.Element {
  const links = laneLinks(row);
  const width = graphWidth(row.input.length, row.output.length);
  const nx = x(row.lane);
  const stroke = { fill: "none", strokeWidth: 1, strokeLinecap: "round" as const };
  const color = laneVar(row.color);
  return (
    <svg
      className={cx("x-commit-graph", className)}
      width={width}
      height={GRAPH_ROW_HEIGHT}
      viewBox={`0 0 ${width} ${GRAPH_ROW_HEIGHT}`}
      data-kind={row.kind}
      aria-hidden="true"
      focusable="false"
    >
      {links.passes.map((p) => (
        <path
          key={`p${p.from}`}
          d={p.from === p.to ? `M ${x(p.from)} 0 V ${GRAPH_ROW_HEIGHT}` : shift(x(p.from), x(p.to))}
          stroke={laneVar(p.color)}
          {...stroke}
        />
      ))}
      {links.joins.map((j) => (
        <path
          key={`j${j.from}`}
          d={j.from === row.lane ? `M ${nx} 0 V ${NODE_Y}` : toNode(x(j.from), nx)}
          stroke={laneVar(j.color)}
          {...stroke}
        />
      ))}
      {links.forks.map((f) => (
        <path
          key={`f${f.to}`}
          d={f.to === row.lane ? `M ${nx} ${NODE_Y} V ${GRAPH_ROW_HEIGHT}` : fromNode(nx, x(f.to))}
          stroke={laneVar(f.color)}
          {...stroke}
        />
      ))}
      {row.kind === "head" ? (
        <circle cx={nx} cy={NODE_Y} r={6.5} fill={color} stroke="var(--bg-1)" strokeWidth={1.5} />
      ) : row.kind === "merge" ? (
        <>
          <circle cx={nx} cy={NODE_Y} r={4.5} fill={color} />
          <circle cx={nx} cy={NODE_Y} r={2} fill="var(--bg-1)" />
        </>
      ) : row.kind === "boundary" ? (
        <circle cx={nx} cy={NODE_Y} r={3.5} fill="var(--bg-1)" stroke={color} strokeWidth={1} strokeDasharray="4 2" />
      ) : (
        <circle cx={nx} cy={NODE_Y} r={3.5} fill={color} />
      )}
    </svg>
  );
}
