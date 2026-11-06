import { describe, expect, it } from "vitest";
import { ICONS, ICON_NAMES } from "./icons";

describe("annotation icons", () => {
  it("registers the general names the annotator needs", () => {
    for (const name of ["arrow-up-right", "square", "type", "droplet", "undo", "redo"]) expect(ICON_NAMES, name).toContain(name);
  });
  it("draws them as strokes only, on the 24 grid", () => {
    for (const name of ["arrow-up-right", "square", "type", "droplet"] as const) {
      expect(ICONS[name].length, name).toBeGreaterThan(0);
      for (const [, attrs] of ICONS[name]) expect(attrs, name).not.toHaveProperty("fill");
    }
  });
});
