import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { resizeKey } from "../../internal/keys";

vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useRef: (v: unknown) => ({ current: v }) }));
const { SplitHandle } = await import("./SplitHandle");

describe("SplitHandle", () => {
  it("is a focusable separator with its value range", () => {
    const html = renderToStaticMarkup(<SplitHandle direction="horizontal" value={260.4} min={180} max={480} onResize={() => {}} />);
    expect(html).toContain('role="separator" aria-orientation="vertical" aria-valuenow="260" aria-valuemin="180" aria-valuemax="480" aria-label="Resize panel" tabindex="0" data-direction="horizontal"');
  });
  it("steps with keys and drags by pointer delta", () => {
    const onResize = vi.fn();
    const el = SplitHandle({ direction: "vertical", value: 200, min: 100, max: 400, onResize, label: "Resize terminal", reverse: true });
    expect(el.props["aria-orientation"]).toBe("horizontal");
    expect(el.props["aria-label"]).toBe("Resize terminal");
    const preventDefault = vi.fn();
    el.props.onKeyDown({ key: "ArrowUp", shiftKey: false, preventDefault });
    expect(onResize).toHaveBeenLastCalledWith(210);
    expect(preventDefault).toHaveBeenCalled();
    const target = { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() };
    el.props.onPointerDown({ clientY: 500, pointerId: 1, currentTarget: target });
    el.props.onPointerMove({ clientY: 450, currentTarget: target });
    expect(onResize).toHaveBeenLastCalledWith(250);
    el.props.onPointerMove({ clientY: 100, currentTarget: target });
    expect(onResize).toHaveBeenLastCalledWith(400);
    el.props.onPointerUp({ pointerId: 1, currentTarget: target });
    expect(target.releasePointerCapture).toHaveBeenCalledWith(1);
  });
});

describe("resizeKey", () => {
  const o = { min: 100, max: 400, step: 10, big: false, axis: "x" as const };
  it("grows, shrinks, clamps and jumps", () => {
    expect(resizeKey("ArrowRight", 200, o)).toBe(210);
    expect(resizeKey("ArrowLeft", 200, { ...o, big: true })).toBe(160);
    expect(resizeKey("ArrowLeft", 105, o)).toBe(100);
    expect(resizeKey("Home", 200, o)).toBe(100);
    expect(resizeKey("End", 200, o)).toBe(400);
    expect(resizeKey("ArrowLeft", 200, { ...o, reverse: true })).toBe(210);
    expect(resizeKey("ArrowUp", 200, o)).toBeNull();
    expect(resizeKey("ArrowDown", 200, { ...o, axis: "y" })).toBe(210);
  });
});
