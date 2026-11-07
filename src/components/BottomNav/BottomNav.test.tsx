import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useId: () => "id", useState: (v: unknown) => [v, () => {}] }));
const { BottomNav } = await import("./BottomNav");

const items = [
  { id: "home", label: "Home", icon: "home" as const },
  { id: "sessions", label: "Sessions", icon: "terminal" as const, badge: 3 },
  { id: "board", label: "Board", icon: "tasks" as const },
  { id: "files", label: "Files", icon: "folder" as const },
  { id: "x", label: "Extra", icon: "star" as const },
  { id: "y", label: "Sixth", icon: "star" as const },
];
const more = {
  label: "More",
  icon: "more" as const,
  items: [
    { id: "settings", label: "Settings", icon: "settings" as const, badge: 2 },
    { id: "inbox", label: "Inbox", icon: "bell" as const, badge: 120 },
  ],
};
const render = (p: Partial<Parameters<typeof BottomNav>[0]> = {}): string => renderToStaticMarkup(<BottomNav items={items} value="home" onChange={() => {}} {...p} />);
const currentHas = (out: string, text: string): boolean => {
  const at = out.indexOf('aria-current="page"');
  return at >= 0 && out.slice(at, out.indexOf("</button>", at)).includes(text);
};

describe("BottomNav", () => {
  it("is a named nav with typed buttons", () => {
    const out = render();
    expect(out).toContain('<nav class="x-bottom-nav" aria-label="Main">');
    expect(out).not.toMatch(/<button(?![^>]*type="button")/);
  });
  it("shows 5 tabs at most, the more tab included", () => {
    expect(render().match(/<button/g)).toHaveLength(5);
    expect(render({ more }).match(/<button/g)).toHaveLength(5);
    expect(render({ more })).not.toContain("Extra");
    expect(render({ more })).toContain("More");
  });
  it("marks only the current tab", () => {
    const out = render({ value: "board" });
    expect(out.match(/aria-current="page"/g)).toHaveLength(1);
    expect(currentHas(out, "Board")).toBe(true);
  });
  it("shows a badge as a number and speaks it", () => {
    const out = render();
    expect(out).toContain('<span class="x-bottom-nav-badge" aria-hidden="true">3</span>');
    expect(out).toContain('<span class="x-sr-only">3 new</span>');
    expect(render({ items: [{ ...items[0], badge: 0 }] })).not.toContain("x-bottom-nav-badge");
  });
  it("caps the badge at 99+", () => {
    expect(render({ items: [{ ...items[0], badge: 120 }] })).toContain(">99+<");
  });
  it("the more tab is a closed dialog trigger that carries the summed badge", () => {
    const out = render({ more });
    expect(out).toContain('aria-haspopup="dialog"');
    expect(out).toContain('aria-expanded="false"');
    expect(out).toContain(">99+<");
    expect(out).not.toContain('role="dialog"');
  });
  it("tints the more tab when the current destination is inside it", () => {
    expect(render({ more, value: "settings" })).toContain("data-current");
    expect(render({ more, value: "home" })).not.toContain("data-current");
  });
  it("moreOpen renders a bottom sheet with the remaining destinations", () => {
    const out = render({ more, moreOpen: true, value: "settings" });
    expect(out).toContain('role="dialog"');
    expect(out).toContain('data-side="bottom"');
    expect(out).toContain('aria-expanded="true"');
    expect(out).toContain("Inbox");
    expect(currentHas(out.slice(out.indexOf('role="dialog"')), "Settings")).toBe(true);
  });
  it("selecting in the sheet navigates and closes it", () => {
    const onChange = vi.fn();
    const onMoreOpenChange = vi.fn();
    const tree = BottomNav({ items, onChange, more, moreOpen: true, onMoreOpenChange }) as any;
    const drawer = tree.props.children[1];
    const firstRow = drawer.props.children.props.children[0].props.children;
    firstRow.props.onClick();
    expect(onChange).toHaveBeenCalledWith("settings");
    expect(onMoreOpenChange).toHaveBeenCalledWith(false);
    drawer.props.onClose();
    expect(onMoreOpenChange).toHaveBeenCalledTimes(2);
  });
  it("takes translated labels", () => {
    const out = render({ labels: { nav: "Chính", badge: (n) => `${n} mới` } });
    expect(out).toContain('aria-label="Chính"');
    expect(out).toContain("3 mới");
  });
  it("uses no inline colour", () => {
    expect(render({ more, moreOpen: true })).not.toMatch(/style=|#[0-9a-f]{3,8}\b|rgb\(/i);
  });
});
