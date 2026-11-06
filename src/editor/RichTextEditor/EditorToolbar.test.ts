import { describe, expect, it, vi } from "vitest";
import { onToolbarKeyDown, toolbarState, toolItems, type ToolbarState } from "./EditorToolbar";

const fake = (active: string[], undo = true, redo = false) => ({
  isActive: (name: string, attrs?: { level?: number }) => active.includes(attrs?.level ? `${name}${attrs.level}` : name),
  can: () => ({ undo: () => undo, redo: () => redo }),
});

const none: ToolbarState = { heading2: false, heading3: false, bold: false, italic: false, bulletList: false, orderedList: false, quote: false, link: false, canUndo: false, canRedo: false };

describe("toolbarState", () => {
  it("maps editor marks and nodes onto toolbar toggles", () => {
    const s = toolbarState(fake(["heading3", "bold", "blockquote", "link", "orderedList"]) as never);
    expect(s).toEqual({ heading2: false, heading3: true, bold: true, italic: false, bulletList: false, orderedList: true, quote: true, link: true, canUndo: true, canRedo: false });
  });
});

describe("toolItems", () => {
  it("lists the MetaCore tool set in order, with the image button only when uploads are possible", () => {
    expect(toolItems(none, { image: false }).map((i) => i.key)).toEqual(["heading2", "heading3", "bold", "italic", "bulletList", "orderedList", "quote", "link", "undo", "redo"]);
    expect(toolItems(none, { image: true }).map((i) => i.key)).toContain("image");
  });
  it("gives toggles aria-pressed state and actions none", () => {
    const items = toolItems({ ...none, bold: true }, { image: true });
    expect(items.find((i) => i.key === "bold")?.pressed).toBe(true);
    expect(items.find((i) => i.key === "italic")?.pressed).toBe(false);
    expect(items.find((i) => i.key === "image")?.pressed).toBeUndefined();
    expect(items.find((i) => i.key === "undo")?.pressed).toBeUndefined();
  });
  it("disables undo/redo by history and everything when disabled", () => {
    const items = toolItems({ ...none, canUndo: true }, { image: false });
    expect(items.find((i) => i.key === "undo")?.disabled).toBe(false);
    expect(items.find((i) => i.key === "redo")?.disabled).toBe(true);
    expect(toolItems({ ...none, canUndo: true, canRedo: true }, { image: true, disabled: true }).every((i) => i.disabled)).toBe(true);
  });
});

describe("onToolbarKeyDown", () => {
  const btn = (disabled = false) => ({ disabled, focus: vi.fn(), hasAttribute: (a: string) => a === "data-x-tool" });
  it("moves focus to the next enabled tool and records it", () => {
    const [a, b, c] = [btn(), btn(true), btn()];
    const setActive = vi.fn();
    const preventDefault = vi.fn();
    onToolbarKeyDown({ key: "ArrowRight", target: a, preventDefault, currentTarget: { querySelectorAll: () => [a, b, c] } } as never, setActive);
    expect(c.focus).toHaveBeenCalled();
    expect(setActive).toHaveBeenCalledWith(2);
    expect(preventDefault).toHaveBeenCalled();
  });
  it("ignores keys from the link form inside the popover", () => {
    const a = btn();
    const input = { hasAttribute: () => false };
    const preventDefault = vi.fn();
    onToolbarKeyDown({ key: "ArrowLeft", target: input, preventDefault, currentTarget: { querySelectorAll: () => [a] } } as never, vi.fn());
    expect(preventDefault).not.toHaveBeenCalled();
    expect(a.focus).not.toHaveBeenCalled();
  });
});
