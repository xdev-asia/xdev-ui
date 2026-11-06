import { describe, expect, it } from "vitest";
import { menuKeyStep, menuTriggerKey, menuTypeahead } from "./menu-keys";

describe("menuTriggerKey", () => {
  it("ArrowDown opens on the first item, ArrowUp on the last", () => {
    expect(menuTriggerKey("ArrowDown")).toBe("first");
    expect(menuTriggerKey("ArrowUp")).toBe("last");
  });
  it("leaves Enter and Space to the button's native click, which opens on the first item", () => {
    expect(menuTriggerKey("Enter")).toBeNull();
    expect(menuTriggerKey(" ")).toBeNull();
    expect(menuTriggerKey("a")).toBeNull();
  });
});

describe("menuKeyStep", () => {
  it("moves with the arrows and wraps", () => {
    expect(menuKeyStep("ArrowDown", 0, 3)).toEqual({ type: "focus", index: 1 });
    expect(menuKeyStep("ArrowDown", 2, 3)).toEqual({ type: "focus", index: 0 });
    expect(menuKeyStep("ArrowUp", 0, 3)).toEqual({ type: "focus", index: 2 });
  });
  it("Home and End go to the ends", () => {
    expect(menuKeyStep("Home", 2, 3)).toEqual({ type: "focus", index: 0 });
    expect(menuKeyStep("End", 0, 3)).toEqual({ type: "focus", index: 2 });
  });
  it("ArrowDown from outside the items goes to the first", () => {
    expect(menuKeyStep("ArrowDown", -1, 3)).toEqual({ type: "focus", index: 0 });
  });
  it("Escape closes; Tab closes and lets focus move on", () => {
    expect(menuKeyStep("Escape", 1, 3)).toEqual({ type: "close" });
    expect(menuKeyStep("Tab", 1, 3)).toEqual({ type: "tab" });
  });
  it("leaves other keys alone", () => {
    expect(menuKeyStep("Enter", 1, 3)).toBeNull();
    expect(menuKeyStep("ArrowRight", 1, 3)).toBeNull();
  });
});

describe("menuTypeahead", () => {
  const labels = ["Edit", "Duplicate", "Delete", "Archive"];
  it("finds the next item starting with the typed text, after the current one", () => {
    expect(menuTypeahead(labels, 0, "d")).toBe(1);
    expect(menuTypeahead(labels, 1, "d")).toBe(2);
    expect(menuTypeahead(labels, 2, "d")).toBe(1);
  });
  it("matches a longer query from the current item", () => {
    expect(menuTypeahead(labels, 1, "de")).toBe(2);
    expect(menuTypeahead(labels, 2, "de")).toBe(2);
  });
  it("is case-insensitive and returns null without a match", () => {
    expect(menuTypeahead(labels, 0, "A")).toBe(3);
    expect(menuTypeahead(labels, 0, "z")).toBeNull();
  });
});
