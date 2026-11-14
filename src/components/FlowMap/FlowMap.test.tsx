import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FLOW_HUB, FLOW_NODE, FlowMap, flowMapLayout } from "./FlowMap";

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
