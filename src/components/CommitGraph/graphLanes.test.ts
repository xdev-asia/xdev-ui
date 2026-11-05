import { describe, expect, it } from "vitest";
import { graphRows, laneLinks, type GraphItem } from "./graphLanes";

const ids = (lanes: { id: string }[]): string[] => lanes.map((l) => l.id);

describe("graphRows", () => {
  it("draws a linear history in one lane", () => {
    const rows = graphRows([
      { id: "c", parents: ["b"] },
      { id: "b", parents: ["a"] },
      { id: "a", parents: [] },
    ]);
    expect(rows.map((r) => r.lane)).toEqual([0, 0, 0]);
    expect(ids(rows[0].input)).toEqual([]);
    expect(ids(rows[0].output)).toEqual(["b"]);
    expect(ids(rows[1].input)).toEqual(["b"]);
    expect(ids(rows[2].output)).toEqual([]);
    expect(rows.map((r) => r.kind)).toEqual(["commit", "commit", "commit"]);
    expect(new Set(rows.map((r) => r.color)).size).toBe(1);
  });

  it("opens a lane for a merge's second parent and closes it where the branches meet", () => {
    const items: GraphItem[] = [
      { id: "m", parents: ["a", "b"] },
      { id: "a", parents: ["r"] },
      { id: "b", parents: ["r"] },
      { id: "r", parents: [] },
    ];
    const rows = graphRows(items);
    expect(rows[0].kind).toBe("merge");
    expect(ids(rows[0].output)).toEqual(["a", "b"]);
    expect(rows[1].lane).toBe(0);
    expect(ids(rows[1].output)).toEqual(["r", "b"]);
    expect(rows[2].lane).toBe(1);
    expect(ids(rows[2].output)).toEqual(["r", "r"]);
    expect(rows[3].lane).toBe(0);
    expect(ids(rows[3].input)).toEqual(["r", "r"]);
    expect(rows[3].output).toEqual([]);
  });

  it("drops later lanes that wait for the same commit", () => {
    const two = graphRows([
      { id: "x", parents: ["r", "r"] },
      { id: "r", parents: [] },
    ]);
    expect(ids(two[0].output)).toEqual(["r", "r"]);
    expect(ids(two[1].input)).toEqual(["r", "r"]);
    expect(ids(two[1].output)).toEqual([]);
  });

  it("opens one lane per parent of an octopus merge", () => {
    const rows = graphRows([
      { id: "o", parents: ["a", "b", "c"] },
      { id: "a", parents: [] },
    ]);
    expect(ids(rows[0].output)).toEqual(["a", "b", "c"]);
    expect(rows[0].kind).toBe("merge");
  });

  it("ends the lane at a root and keeps the others", () => {
    const rows = graphRows([
      { id: "m", parents: ["a", "b"] },
      { id: "a", parents: [] },
      { id: "b", parents: [] },
    ]);
    expect(ids(rows[1].output)).toEqual(["b"]);
    expect(rows[2].lane).toBe(0);
    expect(rows[2].output).toEqual([]);
  });

  it("starts a second lane for a second root the log reaches", () => {
    const rows = graphRows([
      { id: "a", parents: [] },
      { id: "b", parents: [] },
    ]);
    expect(rows.map((r) => r.lane)).toEqual([0, 0]);
    expect(rows[1].color).not.toBe(rows[0].color);
  });

  it("colours lanes from the head, remote and base refs", () => {
    const rows = graphRows(
      [
        { id: "h", parents: ["m"] },
        { id: "m", parents: ["r", "b"] },
        { id: "r", parents: [] },
        { id: "b", parents: [] },
      ],
      { head: "h", remote: "r", base: "b" },
    );
    expect(rows[0].color).toBe("head");
    expect(rows[0].kind).toBe("head");
    expect(rows[1].color).toBe("head");
    expect(rows[1].output.map((l) => l.color)).toEqual(["head", "base"]);
    expect(rows[2].color).toBe("head");
    expect(rows[3].color).toBe("base");
  });

  it("takes marks from refIds for a commit that starts a lane", () => {
    const rows = graphRows([{ id: "u", parents: [], refIds: ["remote"] }]);
    expect(rows[0].color).toBe("remote");
  });

  it("marks a boundary row", () => {
    const rows = graphRows([{ id: "0000000", parents: ["a"], boundary: true }]);
    expect(rows[0].kind).toBe("boundary");
  });

  it("restarts the colour rotation on every call", () => {
    const items: GraphItem[] = [
      { id: "m", parents: ["a", "b"] },
      { id: "a", parents: [] },
      { id: "b", parents: [] },
    ];
    expect(graphRows(items)).toEqual(graphRows(items));
    expect(graphRows(items)[0].color).toBe(0);
    expect(graphRows(items)[0].output[1].color).toBe(1);
  });

  it("wraps the rotation after five colours", () => {
    const rows = graphRows([{ id: "o", parents: ["a", "b", "c", "d", "e", "f"] }]);
    expect(rows[0].output.map((l) => l.color)).toEqual([0, 1, 2, 3, 4, 0]);
    const more = graphRows([{ id: "o", parents: ["a", "b", "c", "d", "e", "f", "g"] }]);
    expect(more[0].output[6].color).toBe(1);
  });
});

describe("laneLinks", () => {
  const rows = graphRows([
    { id: "m", parents: ["a", "b"] },
    { id: "a", parents: ["r"] },
    { id: "b", parents: ["r"] },
    { id: "r", parents: [] },
  ]);
  it("forks a merge into two lanes", () => {
    const l = laneLinks(rows[0]);
    expect(l.joins).toEqual([]);
    expect(l.passes).toEqual([]);
    expect(l.forks.map((f) => f.to)).toEqual([0, 1]);
  });
  it("passes the other lane and continues its own", () => {
    const l = laneLinks(rows[1]);
    expect(l.joins.map((j) => j.from)).toEqual([0]);
    expect(l.passes.map((p) => [p.from, p.to])).toEqual([[1, 1]]);
    expect(l.forks.map((f) => f.to)).toEqual([0]);
  });
  it("joins two lanes at the shared parent", () => {
    const l = laneLinks(rows[3]);
    expect(l.joins.map((j) => j.from)).toEqual([0, 1]);
    expect(l.forks).toEqual([]);
    expect(l.passes).toEqual([]);
  });
  it("shifts a lane left when a lane before it ends", () => {
    const r = graphRows([
      { id: "x", parents: ["p", "q"] },
      { id: "p", parents: [] },
      { id: "q", parents: [] },
    ]);
    expect(laneLinks(r[1]).passes.map((p) => [p.from, p.to])).toEqual([[1, 0]]);
  });
});
