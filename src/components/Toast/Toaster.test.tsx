import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const h = vi.hoisted(() => ({ client: true, setPaused: (_: unknown) => {} }));
vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useEffect: () => {},
  useRef: (v: unknown) => ({ current: v }),
  useState: (v: unknown) => [v, (n: unknown) => h.setPaused(n)],
  useSyncExternalStore: (_s: unknown, client: () => unknown, server: () => unknown) => (h.client ? client() : server()),
}));
const { Toaster } = await import("./Toaster");
const { toast } = await import("./toast-store");

afterEach(() => {
  toast.dismiss();
  h.client = true;
});

describe("Toaster", () => {
  it("renders an empty labelled region on the server", () => {
    h.client = false;
    toast("x");
    expect(renderToStaticMarkup(<Toaster />)).toBe('<section class="x-toaster ws-toasts" aria-label="Notifications" data-position="bottom-end"></section>');
  });
  it("renders the queue with Toast: status by default, alert for danger, tone and description", () => {
    toast("Saved", { tone: "ok" });
    toast("Could not save", { tone: "danger", description: "The server did not answer." });
    const html = renderToStaticMarkup(<Toaster />);
    expect(html).toContain('<div class="ws-toast" role="status" data-tone="ok">');
    expect(html).toContain('<div class="ws-toast" role="alert" data-tone="danger">');
    expect(html).toContain('<span class="ws-toast-desc">The server did not answer.</span>');
    expect(html.match(/aria-label="Dismiss"/g)).toHaveLength(2);
  });
  it("shows at most `max`", () => {
    toast("a");
    toast("b");
    toast("c");
    expect(renderToStaticMarkup(<Toaster max={2} position="top-center" />).match(/class="ws-toast"/g)).toHaveLength(2);
    expect(renderToStaticMarkup(<Toaster position="top-center" />)).toContain('data-position="top-center"');
  });
  it("wires the action and dismiss", () => {
    const onClick = vi.fn();
    toast("Archived", { action: { label: "Undo", onClick } });
    const tree = Toaster({});
    const [t] = findAll(tree, (e) => typeof e.props.onAction === "function");
    t.props.onAction();
    expect(onClick).toHaveBeenCalledOnce();
    t.props.onDismiss();
    expect(renderToStaticMarkup(<Toaster />)).not.toContain("Archived");
  });
  it("pauses on hover and focus, resumes on leave and blur", () => {
    h.setPaused = vi.fn();
    const tree = Toaster({}) as any;
    tree.props.onMouseEnter();
    tree.props.onMouseLeave();
    tree.props.onFocus();
    tree.props.onBlur({ currentTarget: { contains: () => false }, relatedTarget: null });
    expect((h.setPaused as any).mock.calls.map((c: unknown[]) => c[0])).toEqual([true, false, true, false]);
  });
  it("takes translated labels", () => {
    toast("x");
    const html = renderToStaticMarkup(<Toaster labels={{ region: "Thông báo", dismiss: "Đóng" }} />);
    expect(html).toContain('aria-label="Thông báo"');
    expect(html).toContain('aria-label="Đóng"');
  });
});
