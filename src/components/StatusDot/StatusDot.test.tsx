import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StatusDot } from "./StatusDot";

describe("StatusDot", () => {
  it("bare dot carries data-state", () => {
    const html = renderToStaticMarkup(<StatusDot state="working" pulse />);
    expect(html).toContain('data-state="working"');
    expect(html).toContain("ws-pulse");
  });
  it("labelled dot hides the dot from AT", () => {
    const html = renderToStaticMarkup(<StatusDot pr="merged" label="Merged" />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-pr="merged"');
    expect(html).toContain("x-dot-label");
  });
  it("tone carries data-tone", () => {
    const html = renderToStaticMarkup(<StatusDot tone="warn" label="Invited" />);
    expect(html).toContain('data-tone="warn"');
    expect(html).toContain("Invited");
  });
});
