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
  it("label renders as visible text after the dot", () => {
    const html = renderToStaticMarkup(<StatusDot tone="ok" label="Active" />);
    expect(html).toBe('<span class="x-dot-label"><span class="ws-dot" aria-hidden="true" data-tone="ok"></span>Active</span>');
  });
  it("className goes on the label wrapper, or on the dot without a label", () => {
    expect(renderToStaticMarkup(<StatusDot tone="ok" label="Active" className="row-dot" />)).toMatch(/^<span class="x-dot-label row-dot">/);
    expect(renderToStaticMarkup(<StatusDot tone="danger" className="row-dot" />)).toBe('<span class="ws-dot row-dot" data-tone="danger"></span>');
  });
});
