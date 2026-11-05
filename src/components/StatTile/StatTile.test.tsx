import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StatTile } from "./StatTile";

describe("StatTile", () => {
  it("shows label and value", () => {
    const html = renderToStaticMarkup(<StatTile label="Active users" value="1,284" />);
    expect(html).toContain('<p class="x-stat-label">Active users</p>');
    expect(html).toContain('<p class="x-stat-value">1,284</p>');
    expect(html).not.toContain("x-stat-delta");
  });
  it("shows the delta with a trend icon and tone", () => {
    const html = renderToStaticMarkup(<StatTile label="Sign-ins" value="320" delta="+12%" deltaTrend="up" deltaTone="good" hint="vs last 7 days" />);
    expect(html).toContain('class="x-stat-delta" data-tone="good"');
    expect(html).toContain("+12%");
    expect(html).toContain("<svg");
    expect(html).toContain("vs last 7 days");
  });
  it("defaults the delta tone to neutral and omits the icon without a trend", () => {
    const html = renderToStaticMarkup(<StatTile label="a" value="1" delta="0%" />);
    expect(html).toContain('data-tone="neutral"');
    expect(html).not.toContain("<svg");
  });
  it("loading swaps the value for a spinner and sets aria-busy", () => {
    const html = renderToStaticMarkup(<StatTile label="a" value="1" loading labels={{ loading: "Chargement" }} />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Chargement");
    expect(html).not.toContain('class="x-stat-value"');
  });
  it("renders children under the value", () => {
    expect(renderToStaticMarkup(<StatTile label="a" value="1"><i>bar</i></StatTile>)).toContain('<div class="x-stat-extra"><i>bar</i></div>');
  });
});
