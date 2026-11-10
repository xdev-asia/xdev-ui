import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Select } from "./Select";

describe("Select", () => {
  it("renders options with lang-select class", () => {
    const html = renderToStaticMarkup(
      <Select
        aria-label="Language"
        options={[
          { value: "en", label: "English" },
          { value: "vi", label: "Tiếng Việt" },
        ]}
      />,
    );
    expect(html).toContain("lang-select");
    expect(html).toContain('<option value="vi">');
    expect(html).toContain('aria-label="Language"');
  });
  it("passes ref to the native select", () => {
    const ref = { current: null };
    const tree = Select({ options: [], ref });
    expect(tree.type).toBe("select");
    expect(tree.props.ref).toBe(ref);
  });
  it("draws a leading icon and keeps the class on the select", () => {
    const html = renderToStaticMarkup(<Select icon="globe" className="c" aria-label="Language" options={[{ value: "en", label: "English" }]} />);
    expect(html).toMatch(/^<span class="x-select-wrap"><svg class="x-icon x-select-icon"[^>]*aria-hidden="true"/);
    expect(html).toContain('<select class="lang-select c" data-icon="" aria-label="Language">');
  });
});
