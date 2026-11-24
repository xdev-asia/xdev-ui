import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useId: () => "id" }));
const { Switch } = await import("./Switch");

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
  it("hint sits under the label, outside it, and describes the switch", () => {
    const html = renderToStaticMarkup(<Switch label="Auto-commit" hint="Commits after each turn." />);
    expect(html).toBe(
      '<span class="x-switch-field"><label class="x-switch-row"><input type="checkbox" role="switch" class="agent-switch" id="x-switch-id" aria-describedby="x-switch-id-hint"/>Auto-commit</label>' +
        '<small id="x-switch-id-hint" class="x-switch-hint">Commits after each turn.</small></span>',
    );
    const own = renderToStaticMarkup(<Switch id="ac" label="Auto-commit" hint="H" />);
    expect(own).toContain('id="ac" aria-describedby="ac-hint"');
    expect(own).toContain('<small id="ac-hint"');
    expect(renderToStaticMarkup(<Switch label="Auto-commit" />)).not.toContain("aria-describedby");
  });
  it("hideLabel keeps the label for screen readers only", () => {
    const html = renderToStaticMarkup(<Switch label="Enabled" hideLabel />);
    expect(html).toBe('<label class="x-switch-row"><input type="checkbox" role="switch" class="agent-switch"/><span class="x-sr-only">Enabled</span></label>');
    expect(html).not.toContain("hideLabel");
    expect(renderToStaticMarkup(<Switch label="Enabled" />)).not.toContain("x-sr-only");
  });
});
