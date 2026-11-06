import { describe, expect, it } from "vitest";
import { placeFloating } from "./position";

const rect = (top: number, left: number, width: number, height: number) => ({
  top,
  left,
  width,
  height,
  bottom: top + height,
  right: left + width,
});
const viewport = { width: 1000, height: 800 };

describe("placeFloating", () => {
  it("puts the panel below the anchor, aligned to its start", () => {
    expect(placeFloating(rect(100, 200, 80, 32), { width: 220, height: 150 }, viewport)).toEqual({ top: 136, left: 200, side: "bottom" });
  });
  it("aligns the panel's end with the anchor's end", () => {
    expect(placeFloating(rect(100, 200, 80, 32), { width: 220, height: 150 }, viewport, { align: "end" })).toEqual({ top: 136, left: 60, side: "bottom" });
  });
  it("flips above when there is no room below and more room above", () => {
    expect(placeFloating(rect(700, 200, 80, 32), { width: 220, height: 150 }, viewport)).toEqual({ top: 546, left: 200, side: "top" });
  });
  it("stays below when above has even less room", () => {
    expect(placeFloating(rect(60, 200, 80, 32), { width: 220, height: 900 }, viewport).side).toBe("bottom");
  });
  it("asked for top, flips below when there is no room above", () => {
    expect(placeFloating(rect(40, 200, 80, 32), { width: 220, height: 150 }, viewport, { side: "top" })).toEqual({ top: 76, left: 200, side: "bottom" });
  });
  it("keeps the panel inside the viewport horizontally", () => {
    expect(placeFloating(rect(100, 950, 40, 32), { width: 220, height: 100 }, viewport).left).toBe(1000 - 220 - 8);
    expect(placeFloating(rect(100, 10, 40, 32), { width: 220, height: 100 }, viewport, { align: "end" }).left).toBe(8);
  });
});
