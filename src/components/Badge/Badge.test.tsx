import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("sets data-status", () => {
    expect(renderToStaticMarkup(<Badge status="new">new</Badge>)).toContain('data-status="new"');
  });
  it("omits data-status for neutral", () => {
    const html = renderToStaticMarkup(<Badge status="neutral">x</Badge>);
    expect(html).toContain('class="badge"');
    expect(html).not.toContain("data-status");
  });
});
