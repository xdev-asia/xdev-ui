import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BrandMark } from "./BrandMark";

describe("BrandMark", () => {
  it("mark is an img named xDev", () => {
    const html = renderToStaticMarkup(<BrandMark />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="xDev"');
    expect(html).toContain("x-mark");
  });
  it("lockup and tile variants", () => {
    expect(renderToStaticMarkup(<BrandMark variant="lockup" size={32} />)).toContain("x-lockup");
    expect(renderToStaticMarkup(<BrandMark variant="tile" />)).toContain("x-mark-tile");
  });
});
