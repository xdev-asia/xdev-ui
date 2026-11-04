import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const setInner = vi.fn();
vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useId: () => ":t1:",
  useState: (v: unknown) => [v, setInner],
  useEffect: () => {},
}));
const { Tooltip } = await import("./Tooltip");

describe("Tooltip", () => {
  it("links the child to an always-present tooltip", () => {
    const html = renderToStaticMarkup(
      <Tooltip content="Open in editor">
        <button type="button" aria-describedby="other">Open</button>
      </Tooltip>,
    );
    expect(html).toContain('<button type="button" aria-describedby="other x-tip-:t1:">Open</button>');
    expect(html).toContain('<span class="x-tooltip" role="tooltip" id="x-tip-:t1:" data-placement="top">Open in editor</span>');
    expect(html).not.toContain("data-open");
  });
  it("opens on hover and focus, closes on leave and blur", () => {
    const root = Tooltip({ content: "Copy path", children: <button type="button">c</button> });
    const anchor = findAll(root, (e) => e.props.className === "x-tooltip-anchor")[0] ?? root;
    anchor.props.onMouseEnter();
    anchor.props.onFocus();
    expect(setInner).toHaveBeenNthCalledWith(1, true);
    expect(setInner).toHaveBeenNthCalledWith(2, true);
    anchor.props.onMouseLeave();
    anchor.props.onBlur();
    expect(setInner).toHaveBeenLastCalledWith(false);
  });
});
