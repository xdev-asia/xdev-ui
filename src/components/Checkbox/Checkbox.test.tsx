import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("is a native checkbox inside a label", () => {
    const html = renderToStaticMarkup(<Checkbox id="del" label="Delete the branch too" />);
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('<label class="ws-tick" for="del"');
    expect(html).toContain("Delete the branch too");
  });
  it("links the hint with aria-describedby", () => {
    const html = renderToStaticMarkup(<Checkbox id="del" label="Delete" hint="Only when merged" />);
    expect(html).toContain('aria-describedby="del-hint"');
    expect(html).toContain('id="del-hint"');
  });
  it("marks indeterminate and disabled on the wrapper, not as an attribute", () => {
    const html = renderToStaticMarkup(<Checkbox label="All" indeterminate disabled />);
    expect(html).toContain("data-indeterminate");
    expect(html).toContain("data-disabled");
    expect(html).toContain("disabled");
    expect(html).not.toMatch(/ indeterminate=/);
  });
  it("renders bare without label", () => {
    expect(renderToStaticMarkup(<Checkbox aria-label="Pick" />)).not.toContain("<label");
  });
});
