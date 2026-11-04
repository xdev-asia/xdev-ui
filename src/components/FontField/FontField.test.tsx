import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FontField } from "./FontField";

describe("FontField", () => {
  it("lists the suggestions and shows the name in its own font", () => {
    const html = renderToStaticMarkup(<FontField value="Inter" onChange={() => {}} aria-label="UI font" />);
    expect(html).toContain("<datalist");
    expect(html).toContain('<option value="Be Vietnam Pro"');
    expect(html).toContain("font-family");
    expect(html).toContain('aria-label="UI font"');
  });
  it("offers a reset only while a name is set", () => {
    const set = renderToStaticMarkup(<FontField value="Inter" onChange={() => {}} />);
    const empty = renderToStaticMarkup(<FontField value="" onChange={() => {}} />);
    expect(set).toContain("font-field-reset");
    expect(empty).not.toContain("font-field-reset");
    expect(empty).not.toContain("font-family");
  });
  it("takes its own suggestions and labels", () => {
    const html = renderToStaticMarkup(<FontField value="x" onChange={() => {}} suggestions={["Only"]} labels={{ reset: "Mac dinh" }} />);
    expect(html).toContain('<option value="Only"');
    expect(html).not.toContain("Inter");
    expect(html).toContain('aria-label="Mac dinh"');
  });
});
