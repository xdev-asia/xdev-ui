import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Label } from "./Label";

describe("Label", () => {
  it("is a label with the Field label class, linked to its control", () => {
    const html = renderToStaticMarkup(<Label htmlFor="model" className="c" id="model-label">Model</Label>);
    expect(html).toBe('<label class="x-label c" for="model" id="model-label">Model</label>');
  });
  it("required adds a hidden-from-AT asterisk and a screen-reader word", () => {
    const html = renderToStaticMarkup(<Label htmlFor="e" required>Email</Label>);
    expect(html).toBe('<label class="x-label" for="e">Email<span class="x-label-required"><span aria-hidden="true">*</span><span class="x-sr-only"> required</span></span></label>');
  });
  it("labels.required translates the screen-reader word", () => {
    const html = renderToStaticMarkup(<Label htmlFor="e" required labels={{ required: "bắt buộc" }}>Email</Label>);
    expect(html).toContain('<span class="x-sr-only"> bắt buộc</span>');
    expect(html).not.toContain("> required");
  });
  it("shows no marker when not required", () => {
    expect(renderToStaticMarkup(<Label htmlFor="e">Email</Label>)).not.toContain("x-label-required");
  });
  it("matches the label Field renders", async () => {
    const { Field } = await import("../Field/Field");
    const field = renderToStaticMarkup(<Field label="Email" id="e" />);
    expect(field).toContain(renderToStaticMarkup(<Label htmlFor="e">Email</Label>).replace('class="x-label" for="e"', 'for="e" class="x-label"'));
  });
});
