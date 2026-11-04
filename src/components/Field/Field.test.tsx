import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Field } from "./Field";

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
});
