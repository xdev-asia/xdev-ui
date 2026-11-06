import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useId: () => "id" }));
const { Textarea } = await import("./Textarea");

describe("Textarea", () => {
  it("is a labelled textarea with a linked hint", () => {
    const html = renderToStaticMarkup(<Textarea id="p" label="System prompt" hint="Sent before every task" />);
    expect(html).toContain('for="p"');
    expect(html).toContain("<textarea");
    expect(html).toContain('aria-describedby="p-hint"');
    expect(html).toContain('data-resize="vertical"');
    expect(html).not.toContain("ws-mono");
  });
  it("error replaces the hint and marks invalid", () => {
    const html = renderToStaticMarkup(<Textarea id="p" label="Env" hint="hintText" error="Use KEY=value lines." />);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("data-invalid");
    expect(html).not.toContain("hintText");
  });
  it("mono and resize", () => {
    const html = renderToStaticMarkup(<Textarea label="Env" mono resize="none" />);
    expect(html).toContain("kit-textarea ws-mono");
    expect(html).toContain('data-resize="none"');
  });
  it("hint sits outside the label, inside the ws-field wrapper", () => {
    const html = renderToStaticMarkup(<Textarea id="p" label="Env" hint="One per line" />);
    expect(html).toMatch(/^<div class="ws-field"><label for="p">Env<\/label><textarea[^>]*><\/textarea><small id="p-hint">One per line<\/small><\/div>$/);
  });
  it("passes ref to the textarea", () => {
    const ref = { current: null };
    const tree = Textarea({ label: "x", id: "p", ref });
    const ta = (tree.props.children as any[]).find((c) => c?.type === "textarea");
    expect(ta.props.ref).toBe(ref);
  });
});
