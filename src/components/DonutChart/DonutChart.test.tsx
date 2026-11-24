import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DonutChart, donutArcs, type DonutSlice } from "./DonutChart";

const slices: DonutSlice[] = [
  { key: "a", label: "§a§", value: 50, valueLabel: "§50§" },
  { key: "b", label: "§b§", value: 30, valueLabel: "§30§" },
  { key: "c", label: "§c§", value: 20, valueLabel: "§20§" },
  { key: "d", label: "§d§", value: -4, valueLabel: "§-4§" },
];

describe("DonutChart", () => {
  it("splits the ring by share, clockwise from 12 o'clock", () => {
    expect(donutArcs(slices)).toEqual([
      { key: "a", share: 50, start: 0 },
      { key: "b", share: 30, start: 50 },
      { key: "c", share: 20, start: 80 },
      { key: "d", share: 0, start: 100 },
    ]);
    expect(donutArcs([{ key: "z", label: "z", value: 0, valueLabel: "0" }])).toEqual([{ key: "z", share: 0, start: 0 }]);
    expect(donutArcs([{ key: "n", label: "n", value: Number.NaN, valueLabel: "?" }, { key: "o", label: "o", value: 1, valueLabel: "1" }])[1]).toEqual({ key: "o", share: 100, start: 0 });
  });
  it("draws one arc per non-empty slice with a gap, and writes every label and value in the legend", () => {
    const html = renderToStaticMarkup(<DonutChart slices={slices} label="§chart§" center={<b>§total§</b>} />);
    expect(html).toContain('aria-label="§chart§"');
    expect(html).toContain('<svg viewBox="0 0 42 42" width="160" height="160" aria-hidden="true">');
    expect(html.match(/x-donut-slice/g)).toHaveLength(3);
    expect(html).toContain('stroke-dasharray="49.4 50.6"');
    expect(html).toContain('stroke-dashoffset="-25"');
    expect(html).toContain('stroke="var(--accent)"');
    expect(html).toContain('stroke="var(--ok)"');
    for (const l of ["§a§", "§b§", "§c§", "§d§", "§50§", "§-4§", "§total§"]) expect(html).toContain(l);
    expect(html).toContain('title="§a§: §50§"');
  });
  it("fills the ring without a gap for one slice, and ships no English of its own", () => {
    const html = renderToStaticMarkup(<DonutChart slices={[{ key: "a", label: "x", value: 3, valueLabel: "y" }]} label="g" size={96} />);
    expect(html).toContain('stroke-dasharray="100 0"');
    expect(html).toContain('width="96"');
    expect(html).not.toContain("x-donut-center");
    expect(renderToStaticMarkup(<DonutChart slices={[]} label="g" />).replace(/<[^>]+>/g, "")).toBe("");
  });
});
