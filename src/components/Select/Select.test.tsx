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
});
