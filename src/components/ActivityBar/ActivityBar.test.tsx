import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const setInner = vi.fn();
vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useState: (v: unknown) => [v, setInner] }));
const { ActivityBar } = await import("./ActivityBar");

describe("ActivityBar", () => {
  it("renders nav with aria-current and a capped badge", () => {
    const html = renderToStaticMarkup(<ActivityBar active="docs" changeCount={120} />);
    expect(html).toContain("<nav");
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("99+");
    expect(html).toContain('aria-label="Changes (120)"');
  });
  it("hides the badge at 0", () => {
    expect(renderToStaticMarkup(<ActivityBar changeCount={0} />)).not.toContain("activity-badge");
  });
  it("calls onSelect", () => {
    const onSelect = vi.fn();
    findAll(ActivityBar({ onSelect }), (e) => e.type === "button")[0].props.onClick();
    expect(onSelect).toHaveBeenCalledWith("docs");
  });
});
