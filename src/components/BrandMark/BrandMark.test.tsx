import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BrandMark } from "./BrandMark";

describe("BrandMark", () => {
  it("mark is a bare svg named xDev by default, keeping the x-mark class", () => {
    const html = renderToStaticMarkup(<BrandMark size={18} className="ws-logo" />);
    expect(html).toContain('class="x-mark ws-logo"');
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="xDev"');
    expect(html).not.toContain("aria-hidden");
  });
  it("mark with an empty label is decorative and follows currentColor", () => {
    const html = renderToStaticMarkup(<BrandMark size={18} className="ws-logo" label="" />);
    expect(html).toMatch(/^<svg /);
    expect(html).toContain('width="18"');
    expect(html).toContain('height="18"');
    expect(html).toContain('viewBox="250 225 550 550"');
    expect(html).toContain('fill="currentColor"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role="img"');
  });
  it("mark defaults to 24 px", () => {
    expect(renderToStaticMarkup(<BrandMark />)).toContain('width="24"');
  });
  it("lockup and tile variants", () => {
    expect(renderToStaticMarkup(<BrandMark variant="lockup" size={32} />)).toContain("x-lockup");
    expect(renderToStaticMarkup(<BrandMark variant="tile" />)).toContain("x-mark-tile");
  });
});
