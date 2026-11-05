/** Which ref a lane follows, or the index of a rotation colour (0..4). */
export type LaneColor = number | "head" | "remote" | "base";

export type RefMark = "head" | "remote" | "base";

export interface Lane {
  /** The commit this lane is waiting for. */
  id: string;
  color: LaneColor;
}

export interface GraphItem {
  id: string;
  parents: string[];
  /** Marks this commit carries beyond `refs` (e.g. a synthetic row). */
  refIds?: RefMark[];
  /** A boundary row (incoming or outgoing changes): drawn as a dashed ring. */
  boundary?: boolean;
}

export interface GraphRefs {
  head?: string;
  remote?: string;
  base?: string;
}

export interface GraphRow {
  input: Lane[];
  output: Lane[];
  /** Index of the node in `input`, or `input.length` when the commit starts a lane. */
  lane: number;
  color: LaneColor;
  kind: "commit" | "merge" | "head" | "boundary";
}

/** Rotation colours: `x-graph-lane-1..5`. */
export const LANE_COLORS = 5;

/**
 * The lanes of a log, one row per item in log order. The rotation counter is
 * local to the call, so the same log always gets the same colours.
 */
export function graphRows(items: GraphItem[], refs: GraphRefs = {}): GraphRow[] {
  let next = 0;
  const rotate = (): LaneColor => next++ % LANE_COLORS;
  const refColor = (id: string, marks: RefMark[] = []): LaneColor | undefined => {
    if (marks.includes("head") || id === refs.head) return "head";
    if (marks.includes("remote") || id === refs.remote) return "remote";
    if (marks.includes("base") || id === refs.base) return "base";
    return undefined;
  };

  const rows: GraphRow[] = [];
  let previous: Lane[] = [];
  for (const item of items) {
    const input = previous.map((l) => ({ ...l }));
    const index = input.findIndex((l) => l.id === item.id);
    const lane = index === -1 ? input.length : index;
    const color: LaneColor = index === -1 ? (refColor(item.id, item.refIds) ?? rotate()) : input[index].color;

    const output: Lane[] = [];
    let placed = false;
    for (const l of input) {
      if (l.id !== item.id) {
        output.push({ ...l });
      } else if (!placed) {
        placed = true;
        if (item.parents.length > 0) output.push({ id: item.parents[0], color: l.color });
      }
    }
    // A commit that starts its own lane hands its colour to its first parent.
    if (!placed && item.parents.length > 0) output.push({ id: item.parents[0], color });
    for (const parent of item.parents.slice(1)) {
      output.push({ id: parent, color: refColor(parent) ?? rotate() });
    }

    const head = item.refIds?.includes("head") || item.id === refs.head;
    const kind = item.boundary ? "boundary" : head ? "head" : item.parents.length > 1 ? "merge" : "commit";
    rows.push({ input, output, lane, color, kind });
    previous = output;
  }
  return rows;
}

export interface LaneLinks {
  /** Lanes that go past the node: input index to output index. */
  passes: { from: number; to: number; color: LaneColor }[];
  /** Input lanes that end at the node. */
  joins: { from: number; color: LaneColor }[];
  /** Output lanes that start at the node (one per parent). */
  forks: { to: number; color: LaneColor }[];
}

/** Which lane goes where in one row; what the SVG draws. */
export function laneLinks(row: GraphRow): LaneLinks {
  const nodeId = row.input[row.lane]?.id;
  const matched = nodeId !== undefined;
  const passCount = row.input.filter((l) => l.id !== nodeId).length;
  const forkCount = row.output.length - passCount;
  const passes: LaneLinks["passes"] = [];
  const joins: LaneLinks["joins"] = [];
  const forks: LaneLinks["forks"] = [];
  let out = 0;
  let spot = -1;
  row.input.forEach((l, from) => {
    if (l.id !== nodeId) {
      passes.push({ from, to: out++, color: l.color });
      return;
    }
    joins.push({ from, color: l.color });
    if (spot === -1) {
      spot = out;
      if (forkCount > 0) out++;
    }
  });
  const first = matched && forkCount > 0 ? 1 : 0;
  if (first) forks.push({ to: spot, color: row.output[spot].color });
  for (let to = passCount + first; to < row.output.length; to++) {
    forks.push({ to, color: row.output[to].color });
  }
  return { passes, joins, forks };
}
