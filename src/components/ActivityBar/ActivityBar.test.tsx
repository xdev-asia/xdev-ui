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
  it("adds extra and bottom items with active state, badges and onSelect", () => {
    const extraItems = [{ id: "board", icon: "split" as const, label: "Board", badge: 3 }, { id: "inbox", icon: "inbox" as const, label: "Inbox", badge: true }];
    const bottomItems = [{ id: "settings", icon: "settings" as const, label: "Settings", badge: 0 }];
    const html = renderToStaticMarkup(<ActivityBar active="board" extraItems={extraItems} bottomItems={bottomItems} />);
    expect(html).toContain(`aria-label="Board"`);
    expect(html).toContain("activity-end");
    expect(html).toContain("data-dot");
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html.match(/activity-badge/g)).toHaveLength(2);
    const onSelect = vi.fn();
    const buttons = findAll(ActivityBar({ extraItems, bottomItems, onSelect }), (e) => e.type === "button");
    expect(buttons).toHaveLength(8 + 2 + 1);
    buttons[8].props.onClick();
    buttons[10].props.onClick();
    expect(onSelect).toHaveBeenNthCalledWith(1, "board");
    expect(onSelect).toHaveBeenNthCalledWith(2, "settings");
    expect(setInner).toHaveBeenCalledWith("settings");
  });
  it("renders no end group without bottomItems", () => {
    expect(renderToStaticMarkup(<ActivityBar />)).not.toContain("activity-end");
  });
});
