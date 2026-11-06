import { describe, expect, it } from "vitest";
import { fitWidth, renameExtension, rotatedSize, sameAspect } from "./crop";

describe("crop helpers", () => {
  it("swaps sides on quarter turns only", () => {
    expect(rotatedSize(400, 300, 90)).toEqual({ width: 300, height: 400 });
    expect(rotatedSize(400, 300, -270)).toEqual({ width: 300, height: 400 });
    expect(rotatedSize(400, 300, 180)).toEqual({ width: 400, height: 300 });
  });
  it("scales down to the max width and never up", () => {
    expect(fitWidth(3200, 1800, 1600)).toEqual({ width: 1600, height: 900 });
    expect(fitWidth(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
  it("compares ratios with a relative tolerance", () => {
    expect(sameAspect(1029, 480, 1029 / 480)).toBe(true);
    expect(sameAspect(1280, 721, 16 / 9)).toBe(true);
    expect(sameAspect(1000, 1000, 16 / 9)).toBe(false);
    expect(sameAspect(0, 10, 1)).toBe(false);
  });
  it("renames the extension", () => {
    expect(renameExtension("photo.JPG", "webp")).toBe("photo.webp");
    expect(renameExtension("a.b.png", "webp")).toBe("a.b.webp");
    expect(renameExtension("noext", "webp")).toBe("noext.webp");
    expect(renameExtension(".png", "webp")).toBe("image.webp");
  });
});
