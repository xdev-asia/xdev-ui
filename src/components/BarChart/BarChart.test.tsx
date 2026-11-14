import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BarChart, type BarDatum } from "./BarChart";

const bars: BarDatum[] = [
  { key: "a", label: "§a§", value: 200, valueLabel: "§200§" },
  { key: "b", label: "§b§", value: 50, valueLabel: "§50§" },
  { key: "c", label: "§c§", value: -3, valueLabel: "§-3§" },
];

describe("BarChart", () => {
  it("scales bars to the largest value and writes each value", () => {
    const html = renderToStaticMarkup(<BarChart bars={bars} label="§chart§" />);
    expect(html).toContain('aria-label="§chart§"');
    expect(html).toContain('data-orientation="horizontal"');
    expect(html).toContain("width:100%");
    expect(html).toContain("width:25%");
    expect(html).toContain("width:0%");
    for (const l of ["§a§", "§b§", "§c§", "§200§", "§50§", "§-3§"]) expect(html).toContain(l);
    expect(html).toContain('title="§a§: §200§"');
  });

  it("draws vertical bars by height", () => {
    const html = renderToStaticMarkup(<BarChart bars={bars} label="g" orientation="vertical" />);
    expect(html).toContain('data-orientation="vertical"');
    expect(html).toContain("height:25%");
  });

  it("handles no bars and all zero, and ships no English of its own", () => {
    expect(renderToStaticMarkup(<BarChart bars={[]} label="g" />)).not.toContain("x-barchart-item");
    const html = renderToStaticMarkup(<BarChart bars={[{ key: "z", label: "§z§", value: 0, valueLabel: "§0§" }]} label="g" />);
    expect(html).toContain("width:0%");
    const text = html.replace(/<[^>]*>/g, " ").replace(/§[^§]*§/g, " ");
    expect(text.trim()).toBe("");
  });
});
