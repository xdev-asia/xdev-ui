import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useId: () => "id" }));
const { Field } = await import("./Field");

describe("Field", () => {
  it("links the hint with aria-describedby", () => {
    const html = renderToStaticMarkup(<Field label="Branch" hint="kebab-case" id="b" />);
    expect(html).toContain('for="b"');
    expect(html).toContain('aria-describedby="b-hint"');
    expect(html).toContain('<small id="b-hint">kebab-case</small>');
    expect(html).not.toContain("aria-invalid");
  });
  it("error replaces hint and marks invalid", () => {
    const html = renderToStaticMarkup(<Field label="Branch" hint="hintText" error="Required" id="b" />);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("Required");
    expect(html).not.toContain("hintText");
    expect(html).toContain("data-invalid");
  });
  it("hint and error sit outside the label, inside the ws-field wrapper", () => {
    const html = renderToStaticMarkup(<Field label="Branch" hint="kebab-case" id="b" className="extra" />);
    expect(html).toMatch(/^<div class="ws-field extra"><label for="b">Branch<\/label><input id="b" aria-describedby="b-hint"\/><small id="b-hint">kebab-case<\/small><\/div>$/);
    const err = renderToStaticMarkup(<Field label="Branch" error="Required" id="b" />);
    expect(err).toContain('<label for="b">Branch</label>');
    expect(err).toMatch(/<\/label><input[^>]*aria-invalid="true"[^>]*\/><small id="b-hint">Required<\/small><\/div>$/);
  });
  it("passes ref to the input", () => {
    const ref = { current: null };
    const tree = Field({ label: "x", id: "b", ref });
    const input = (tree.props.children as any[]).find((c) => c?.type === "input");
    expect(input.props.ref).toBe(ref);
  });
});
