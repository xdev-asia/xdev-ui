import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FLOW_HUB, FLOW_NODE, FlowMap, flowMapLayout, flowMapSides } from "./FlowMap";

const GAP = 16;
type Box = { x: number; y: number; w: number; h: number };
const overlap = (a: Box, b: Box) => Math.abs(a.x - b.x) < (a.w + b.w) / 2 + GAP && Math.abs(a.y - b.y) < (a.h + b.h) / 2 + GAP;

describe("flowMapLayout", () => {
  it("places nothing for no node and a single node straight above the hub", () => {
    expect(flowMapLayout(0)).toEqual([]);
    const [one] = flowMapLayout(1);
    expect(one.x).toBeCloseTo(0);
    expect(one.y).toBeLessThan(0);
  });

  it("never lets two nodes, or a node and the hub, overlap", () => {
    const hub: Box = { x: 0, y: 0, ...FLOW_HUB };
    for (let n = 1; n <= 30; n++) {
      const boxes = flowMapLayout(n).map((p) => ({ ...p, ...FLOW_NODE }));
      for (const [i, a] of boxes.entries()) {
        expect(overlap(a, hub), `n=${n} node ${i} over the hub`).toBe(false);
        for (const b of boxes.slice(i + 1)) expect(overlap(a, b), `n=${n} node ${i}`).toBe(false);
      }
    }
  });
});

describe("flowMapSides", () => {
  it("puts sources left of the hub and nodes right of it, clear of it and of each other", () => {
    const hub: Box = { x: 0, y: 0, ...FLOW_HUB };
    for (const [l, r] of [[1, 1], [3, 7], [12, 2]]) {
      const { left, right } = flowMapSides(l, r);
      expect(left).toHaveLength(l);
      expect(right).toHaveLength(r);
      expect(left.every((p) => p.x < 0) && right.every((p) => p.x > 0)).toBe(true);
      const boxes = [...left, ...right].map((p) => ({ ...p, ...FLOW_NODE }));
      for (const [i, a] of boxes.entries()) {
        expect(overlap(a, hub)).toBe(false);
        for (const b of boxes.slice(i + 1)) expect(overlap(a, b)).toBe(false);
      }
    }
  });

  it("centres each column on the hub", () => {
    const { left, right } = flowMapSides(1, 2);
    expect(left[0].y).toBeCloseTo(0);
    expect(right[0].y + right[1].y).toBeCloseTo(0);
  });
});

describe("FlowMap", () => {
  const nodes = [
    { id: "openai", name: "OpenAI", color: "seagreen", detail: "12 requests", active: true },
    { id: "groq", name: "Groq", src: "/groq.png" },
  ];
  const html = renderToStaticMarkup(<FlowMap label="Traffic" hub={{ name: "xDev LLM" }} nodes={nodes} />);

  it("is a named viewport with the hub and every node in words", () => {
    expect(html).toContain('aria-label="Traffic"');
    expect(html).toContain("xDev LLM");
    expect(html).toContain("OpenAI");
    expect(html).toContain("12 requests");
    expect(html).toContain("Groq");
    expect(html).toContain('src="/groq.png"');
  });

  it("draws one edge per node and marks the active one", () => {
    expect(html.match(/class="x-flowmap-edge"/g)).toHaveLength(2);
    expect(html.match(/data-active=""/g)).toHaveLength(2); // the node and its edge
  });

  it("with sources, reads left to right on curves, coloured by side, sized by weight and toned by failures", () => {
    const routed = renderToStaticMarkup(
      <FlowMap
        label="Traffic"
        hub={{ name: "Hub", detail: "54 requests" }}
        sources={[{ id: "ci", name: "CI bot", detail: "50 requests", active: true, weight: 1 }]}
        nodes={[{ id: "openai", name: "OpenAI", detail: "54 requests, 6 failed", active: true, weight: 0.5, tone: "danger" }, { id: "groq", name: "Groq" }]}
      />,
    );
    expect(routed).toContain("CI bot");
    expect(routed).toContain("54 requests, 6 failed");
    expect(routed.match(/class="x-flowmap-edge"/g)).toHaveLength(3);
    expect(routed.match(/class="x-flowmap-glow"/g)).toHaveLength(2); // the two active edges
    expect(routed).toContain('<g data-side="in">');
    expect(routed).toContain('<g data-side="out" data-tone="danger">');
    expect(routed).toContain('<ul class="x-flowmap-nodes" data-side="in">');
    expect(routed).toContain("--x-flowmap-weight:0.5");
    expect(routed).toMatch(/d="M[\d.]+ [\d.]+C/); // curves, not straight lines
  });

  it("lays a track under every edge and runs packets only on the ones that carried traffic, more for more weight", () => {
    const routed = renderToStaticMarkup(
      <FlowMap
        label="Traffic"
        hub={{ name: "Hub" }}
        sources={[{ id: "ci", name: "CI bot", active: true, weight: 1 }]}
        nodes={[{ id: "a", name: "A", active: true, weight: 0 }, { id: "b", name: "B", weight: 1 }]}
      />,
    );
    expect(routed.match(/class="x-flowmap-track"/g)).toHaveLength(3);
    expect(routed.match(/class="x-flowmap-packet"/g)).toHaveLength(4); // three on the heavy edge, one on the light
    const ids = [...routed.matchAll(/<path id="([^"]+)" class="x-flowmap-edge"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(3);
    for (const href of routed.matchAll(/<mpath href="#([^"]+)"/g)) expect(ids).toContain(href[1]);
  });

  it("has zoom in, zoom out and fit controls, translatable", () => {
    expect(html).toContain('aria-label="Zoom in"');
    expect(html).toContain('aria-label="Zoom out"');
    expect(html).toContain('aria-label="Fit to view"');
    const vi = renderToStaticMarkup(<FlowMap label="Lưu lượng" hub={{ name: "Hub" }} nodes={[]} labels={{ zoomIn: "Phóng to", controls: "Thu phóng" }} />);
    expect(vi).toContain('aria-label="Phóng to"');
    expect(vi).toContain('aria-label="Thu phóng"');
  });

  it("shows only the hub when there are no nodes", () => {
    const empty = renderToStaticMarkup(<FlowMap label="Traffic" hub={{ name: "Hub" }} nodes={[]} />);
    expect(empty).toContain("Hub");
    expect(empty).not.toContain("x-flowmap-edge\"");
    expect(empty).not.toContain("<ul");
  });
});
