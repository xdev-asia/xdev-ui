import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const h = vi.hoisted(() => ({ client: false }));
vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useId: () => ":p1:",
  useRef: (v: unknown) => ({ current: v }),
  useEffect: () => {},
  useLayoutEffect: () => {},
  useSyncExternalStore: (_s: unknown, client: () => boolean, server: () => boolean) => (h.client ? client() : server()),
}));
vi.mock("react-dom", () => ({ createPortal: (node: unknown, target: unknown) => createElement("x-portal", { target }, node as never) }));
const { Popover } = await import("./Popover");

describe("Popover", () => {
  it("passes ARIA props to a trigger function and renders the panel when open", () => {
    const html = renderToStaticMarkup(
      <Popover
        open
        onClose={() => {}}
        label="Notifications"
        placement="bottom-end"
        trigger={(p) => (
          <button type="button" {...p}>
            Bell
          </button>
        )}
      >
        <p>2 checks failed</p>
      </Popover>,
    );
    expect(html).toContain('<button type="button" aria-expanded="true" aria-controls="x-pop-:p1:" aria-haspopup="dialog">Bell</button>');
    expect(html).toContain('<div class="ws-menu-backdrop" aria-hidden="true"></div>');
    expect(html).toContain('id="x-pop-:p1:" class="x-popover" role="dialog" aria-label="Notifications" data-placement="bottom-end" tabindex="-1"');
  });
  it("renders only the anchor when closed", () => {
    const html = renderToStaticMarkup(
      <Popover open={false} onClose={() => {}} trigger={<span>anchor</span>}>
        body
      </Popover>,
    );
    expect(html).toBe('<span class="x-popover-anchor"><span>anchor</span></span>');
  });
  it("closes on an outside click", () => {
    const onClose = vi.fn();
    findAll(Popover({ open: true, onClose }), (e) => e.props.className === "ws-menu-backdrop")[0].props.onClick();
    expect(onClose).toHaveBeenCalled();
  });

  describe("portal", () => {
    afterEach(() => {
      h.client = false;
      vi.unstubAllGlobals();
    });
    const mounted = () => {
      h.client = true;
      const body = { tag: "body" };
      vi.stubGlobal("document", { body });
      return body;
    };
    it("renders backdrop and panel into document.body once mounted; the trigger stays in place", () => {
      const body = mounted();
      const tree = Popover({ open: true, onClose() {}, trigger: <button type="button">t</button>, children: "x" });
      const [portal] = findAll(tree, (e) => e.type === "x-portal");
      expect(portal.props.target).toBe(body);
      expect(findAll(portal, (e) => e.props.className === "x-popover")[0].props["data-portal"]).toBe("");
      expect(findAll(portal, (e) => e.props.className === "ws-menu-backdrop")).toHaveLength(1);
      expect(findAll(portal, (e) => e.type === "button")).toHaveLength(0);
    });
    it("portal={false} keeps the panel inline", () => {
      mounted();
      const tree = Popover({ open: true, onClose() {}, portal: false, children: "x" });
      expect(findAll(tree, (e) => e.type === "x-portal")).toHaveLength(0);
      expect(findAll(tree, (e) => e.props.className === "x-popover")[0].props["data-portal"]).toBeUndefined();
    });
    it("renders inline on the server, so SSR markup is unchanged", () => {
      expect(
        renderToStaticMarkup(
          <Popover open onClose={() => {}}>
            x
          </Popover>,
        ),
      ).not.toContain("data-portal");
    });
  });
});
