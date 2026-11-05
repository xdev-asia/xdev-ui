import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CommitGraph, graphWidth } from "./CommitGraph";
import { graphRows, type GraphItem, type GraphRow } from "./graphLanes";

const render = (row: GraphRow): string => renderToStaticMarkup(<CommitGraph row={row} />);
const one = (item: GraphItem, refs = {}): GraphRow => graphRows([item], refs)[0];

describe("CommitGraph", () => {
  it("draws a plain commit as a filled 3.5 node", () => {
    const html = render(one({ id: "a", parents: ["b"] }));
    expect(html).toContain('data-kind="commit"');
    expect(html).toContain('r="3.5"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("draws a merge as a 4.5 ring with a 2 centre", () => {
    const html = render(one({ id: "m", parents: ["a", "b"] }));
    expect(html).toContain('r="4.5"');
    expect(html).toContain('r="2"');
    expect(html).toContain('fill="var(--bg-1)"');
  });

  it("draws HEAD as a 6.5 node with a 1.5 stroke", () => {
    const html = render(one({ id: "h", parents: [] }, { head: "h" }));
    expect(html).toContain('r="6.5"');
    expect(html).toContain('stroke-width="1.5"');
    expect(html).toContain("var(--x-graph-head)");
  });

  it("draws a boundary node with a dashed ring", () => {
    const html = render(one({ id: "0000000", parents: [], boundary: true }));
    expect(html).toContain('stroke-dasharray="4 2"');
  });

  it("is 11 * (max(in, out, 1) + 1) wide", () => {
    expect(graphWidth(0, 0)).toBe(22);
    expect(graphWidth(3, 1)).toBe(44);
    expect(graphWidth(1, 5)).toBe(66);
    const rows = graphRows([{ id: "m", parents: ["a", "b", "c"] }]);
    expect(render(rows[0])).toContain('width="44"');
    expect(render(rows[0])).toContain('height="24"');
  });

  it("colours only through the graph tokens", () => {
    const rows = graphRows(
      [
        { id: "h", parents: ["m"] },
        { id: "m", parents: ["r", "b"] },
        { id: "r", parents: [] },
        { id: "b", parents: [] },
      ],
      { head: "h", remote: "r", base: "b" },
    );
    const html = rows.map(render).join("");
    const colors = [...html.matchAll(/(?:stroke|fill)="([^"]*)"/g)].map((m) => m[1]).filter((c) => c !== "none");
    expect(colors.length).toBeGreaterThan(0);
    for (const c of colors) expect(c).toMatch(/^var\(--(x-graph-(head|remote|base|lane-[1-5])|bg-1)\)$/);
  });

  it("holds no colour literal in its source", () => {
    const source = readFileSync(new URL("./CommitGraph.tsx", import.meta.url), "utf8");
    expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  });
});
