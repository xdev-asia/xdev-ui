import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("is a checkbox with role=switch", () => {
    const html = renderToStaticMarkup(<Switch aria-label="Auto" />);
    expect(html).toContain('role="switch"');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("agent-switch");
    expect(html).not.toContain("x-switch-row");
  });
  it("wraps in a row when labelled", () => {
    expect(renderToStaticMarkup(<Switch label="Auto-commit" />)).toContain("x-switch-row");
  });
});
