import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Heatmap, type HeatmapCell } from "./Heatmap";

const cells: HeatmapCell[] = [
  { key: "2026-11-01", level: 0, label: "§a§" },
  { key: "2026-11-02", level: 2, label: "§b§" },
  { key: "2026-11-03", level: 4, label: "§c§" },
];

const count = (html: string, needle: string) => html.split(needle).length - 1;

describe("Heatmap", () => {
  it("renders one cell per day with its level and label", () => {
    const html = renderToStaticMarkup(<Heatmap cells={cells} label="§grid§" />);
    expect(count(html, 'class="x-heatmap-cell"')).toBe(3);
    expect(html).toContain('data-level="0"');
    expect(html).toContain('data-level="2"');
    expect(html).toContain('data-level="4"');
    expect(html).toContain('aria-label="§grid§"');
    for (const l of ["§a§", "§b§", "§c§"]) expect(html).toContain(`title="${l}"`);
  });

  it("pads the first column to the weekday", () => {
    expect(renderToStaticMarkup(<Heatmap cells={cells} label="g" startWeekday={3} />)).toContain("grid-row-start:4");
    expect(renderToStaticMarkup(<Heatmap cells={cells} label="g" />)).not.toContain("grid-row-start");
    expect(renderToStaticMarkup(<Heatmap cells={cells} label="g" startWeekday={99} />)).toContain("grid-row-start:7");
  });

  it("shows the legend only with both ends, and ships no English of its own", () => {
    const bare = renderToStaticMarkup(<Heatmap cells={cells} label="g" lessLabel="§lo§" />);
    expect(bare).not.toContain("x-heatmap-legend");
    const html = renderToStaticMarkup(<Heatmap cells={cells} label="g" lessLabel="§lo§" moreLabel="§hi§" />);
    expect(html).toContain("§lo§");
    expect(html).toContain("§hi§");
    const text = html.replace(/<[^>]*>/g, " ");
    expect(text).not.toMatch(/\b(less|more)\b/i);
  });

  it("handles no cells", () => {
    expect(count(renderToStaticMarkup(<Heatmap cells={[]} label="g" />), "x-heatmap-cell")).toBe(0);
  });
});
