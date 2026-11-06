import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { IconButton } from "../IconButton/IconButton";

const h = vi.hoisted(() => ({ effects: [] as Array<() => void | (() => void)> }));
vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useId: () => "id",
  useEffect: (fn: () => void | (() => void)) => void h.effects.push(fn),
  useRef: (v: unknown) => ({ current: v }),
}));
const { Drawer } = await import("./Drawer");

describe("Drawer", () => {
  it("is a labelled modal dialog with a close button", () => {
    const html = renderToStaticMarkup(<Drawer title="Edit banner" description="Shown on the home page" onClose={() => {}} />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="x-drawer-id"');
    expect(html).toContain('aria-describedby="x-drawer-d-id"');
    expect(html).toContain('aria-label="Close"');
    expect(html).toContain('data-side="end"');
  });
  it("renders the footer only when given", () => {
    expect(renderToStaticMarkup(<Drawer title="x" onClose={() => {}} />)).not.toContain("x-drawer-foot");
    expect(renderToStaticMarkup(<Drawer title="x" onClose={() => {}} footer={<b>f</b>} />)).toContain('<footer class="x-drawer-foot"><b>f</b></footer>');
  });
  it("modal false renders markup only", () => {
    const html = renderToStaticMarkup(<Drawer title="x" modal={false} onClose={() => {}} />);
    expect(html).not.toContain("aria-modal");
    expect(html).not.toContain("data-modal");
  });
  it("close button and Esc call onClose, but not while busy", () => {
    const onClose = vi.fn();
    const tree = Drawer({ title: "x", onClose });
    findAll(tree, (e) => e.type === IconButton)[0].props.onClick();
    tree.props.onKeyDown({ key: "Escape", stopPropagation() {} });
    expect(onClose).toHaveBeenCalledTimes(2);
    const busy = Drawer({ title: "x", onClose, busy: true });
    busy.props.onKeyDown({ key: "Escape", stopPropagation() {} });
    findAll(busy, (e) => e.type === IconButton)[0].props.onClick();
    expect(onClose).toHaveBeenCalledTimes(2);
  });
  it("takes translated labels", () => {
    expect(renderToStaticMarkup(<Drawer title="x" onClose={() => {}} labels={{ close: "Đóng" }} />)).toContain('aria-label="Đóng"');
  });
});
