import { describe, expect, it } from "vitest";
import { checkImageFile, imageFilesOf } from "./insertImage";

describe("checkImageFile", () => {
  it("accepts JPG, PNG and WebP up to the limit", () => {
    expect(checkImageFile({ type: "image/png", size: 10 * 1024 * 1024 })).toBeNull();
    expect(checkImageFile({ type: "image/jpeg", size: 1 })).toBeNull();
    expect(checkImageFile({ type: "image/webp", size: 1 })).toBeNull();
  });
  it("refuses other types and files over the limit", () => {
    expect(checkImageFile({ type: "image/gif", size: 1 })).toBe("type");
    expect(checkImageFile({ type: "image/svg+xml", size: 1 })).toBe("type");
    expect(checkImageFile({ type: "image/png", size: 10 * 1024 * 1024 + 1 })).toBe("size");
    expect(checkImageFile({ type: "image/png", size: 2048 }, 1024)).toBe("size");
  });
});

describe("imageFilesOf", () => {
  it("keeps image/* files and tolerates a missing list", () => {
    const list = [{ type: "image/png" }, { type: "text/plain" }, { type: "image/gif" }];
    expect(imageFilesOf(list)).toEqual([{ type: "image/png" }, { type: "image/gif" }]);
    expect(imageFilesOf(null)).toEqual([]);
  });
});
