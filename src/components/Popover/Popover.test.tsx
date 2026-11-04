import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useId: () => ":p1:",
  useRef: (v: unknown) => ({ current: v }),
  useEffect: () => {},
}));
const { Popover } = await import("./Popover");

describe("Popover", () => {
  it("passes ARIA props to a trigger function and renders the panel when open", () => {
    const html = renderToStaticMarkup(
      <Popover open onClose={() => {}} label="Notifications" placement="bottom-end" trigger={(p) => <button type="button" {...p}>Bell</button>}>
        <p>2 checks failed</p>
      </Popover>,
    );
    expect(html).toContain('<button type="button" aria-expanded="true" aria-controls="x-pop-:p1:" aria-haspopup="dialog">Bell</button>');
    expect(html).toContain('<div class="ws-menu-backdrop" aria-hidden="true"></div>');
    expect(html).toContain('id="x-pop-:p1:" class="x-popover" role="dialog" aria-label="Notifications" data-placement="bottom-end" tabindex="-1"');
  });
  it("renders only the anchor when closed", () => {
    const html = renderToStaticMarkup(<Popover open={false} onClose={() => {}} trigger={<span>anchor</span>}>body</Popover>);
    expect(html).toBe('<span class="x-popover-anchor"><span>anchor</span></span>');
  });
  it("closes on an outside click", () => {
    const onClose = vi.fn();
    findAll(Popover({ open: true, onClose }), (e) => e.props.className === "ws-menu-backdrop")[0].props.onClick();
    expect(onClose).toHaveBeenCalled();
  });
});
