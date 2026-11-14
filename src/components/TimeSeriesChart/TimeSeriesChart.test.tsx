import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TimeSeriesChart, type TimeSeriesPoint } from "./TimeSeriesChart";

const points: TimeSeriesPoint[] = [
  { key: "a", value: 10, label: "§a§" },
  { key: "b", value: 20, label: "§b§" },
  { key: "c", value: null, label: "§c§" },
  { key: "d", value: 5, label: "§d§" },
  { key: "e", value: 0, label: "§e§" },
];

const count = (html: string, needle: string) => html.split(needle).length - 1;

describe("TimeSeriesChart", () => {
  it("draws a line and an area, broken at null points", () => {
    const html = renderToStaticMarkup(<TimeSeriesChart points={points} label="§chart§" />);
    expect(html).toContain('aria-label="§chart§"');
    const d = /class="x-tschart-line" d="([^"]+)"/.exec(html)?.[1] ?? "";
    expect(count(d, "M")).toBe(2);
    expect(html).toContain("x-tschart-area");
    expect(count(html, 'class="x-tschart-col"')).toBe(5);
    expect(count(html, 'class="x-tschart-dot"')).toBe(4);
  });

  it("puts the largest value on the top gridline", () => {
    const html = renderToStaticMarkup(<TimeSeriesChart points={points} label="g" />);
    expect(html).toContain("bottom:100%");
    expect(html).toContain("bottom:0%");
  });

  it("writes every label into the tooltip and the table view", () => {
    const html = renderToStaticMarkup(<TimeSeriesChart points={points} label="g" />);
    for (const l of ["§a§", "§b§", "§c§", "§d§", "§e§"]) expect(count(html, l)).toBe(2);
    expect(html).toContain('class="x-sr-only"');
  });

  it("shows ticks in range and axis labels, and ships no English of its own", () => {
    const html = renderToStaticMarkup(
      <TimeSeriesChart
        points={points}
        label="g"
        maxLabel="§max§"
        zeroLabel="§0§"
        ticks={[
          { index: 0, label: "§t0§" },
          { index: 4, label: "§t4§" },
          { index: 9, label: "§t9§" },
        ]}
      />,
    );
    expect(html).toContain("§max§");
    expect(html).toContain("§0§");
    expect(html).toContain('data-align="start"');
    expect(html).toContain('data-align="end"');
    expect(html).not.toContain("§t9§");
    const text = html.replace(/<[^>]*>/g, " ").replace(/§[^§]*§/g, " ");
    expect(text.trim()).toBe("g");
  });

  it("handles no points and all zero", () => {
    expect(renderToStaticMarkup(<TimeSeriesChart points={[]} label="g" />)).not.toContain("x-tschart-line");
    const html = renderToStaticMarkup(
      <TimeSeriesChart
        points={[
          { key: "a", value: 0, label: "a" },
          { key: "b", value: 0, label: "b" },
        ]}
        label="g"
      />,
    );
    expect(html).not.toContain("NaN");
    expect(html).toContain("x-tschart-line");
  });
});
