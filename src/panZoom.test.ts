import { describe, expect, it } from "vitest";
import { clampZoom, fitScale, percentOf, stepZoom, wheelFactor, zoomAt, zoomKey } from "./panZoom";

describe("fitScale", () => {
  const box = { w: 400, h: 300 };
  it("never upscales a raster image", () => {
    expect(fitScale({ w: 100, h: 50 }, box, { padding: 0, upscale: false })).toBe(1);
  });
  it("upscales a vector image to fill the box", () => {
    expect(fitScale({ w: 100, h: 50 }, box, { padding: 0, upscale: true })).toBe(4);
  });
  it("shrinks a large image to the limiting side, inside the padding", () => {
    expect(fitScale({ w: 800, h: 300 }, box, { padding: 0, upscale: false })).toBe(0.5);
    expect(fitScale({ w: 800, h: 300 }, box, { padding: 50, upscale: false })).toBe(0.375);
  });
  it("is 1 for an empty size or box", () => {
    expect(fitScale({ w: 0, h: 10 }, box, { padding: 0, upscale: true })).toBe(1);
    expect(fitScale({ w: 10, h: 10 }, { w: 40, h: 40 }, { padding: 20, upscale: true })).toBe(1);
  });
});

describe("zoom steps", () => {
  it("clamps to 0.25..8", () => {
    expect(clampZoom(0.1)).toBe(0.25);
    expect(clampZoom(20)).toBe(8);
    expect(clampZoom(2)).toBe(2);
  });
  it("steps by 1.25 in and out, and stops at the limits", () => {
    expect(stepZoom(1, 1)).toBe(1.25);
    expect(stepZoom(1.25, -1)).toBe(1);
    expect(stepZoom(8, 1)).toBe(8);
    expect(stepZoom(0.25, -1)).toBe(0.25);
  });
  it("steps within custom limits", () => {
    expect(stepZoom(0.2, -1, 1.25, 0.1, 4)).toBeCloseTo(0.16);
    expect(stepZoom(0.1, -1, 1.25, 0.1, 4)).toBe(0.1);
    expect(stepZoom(4, 1, 1.25, 0.1, 4)).toBe(4);
  });
});

describe("zoomAt", () => {
  it("keeps the content under the cursor fixed", () => {
    const state = { zoom: 1, x: 10, y: 20 };
    const point = { x: 110, y: 70 };
    const next = zoomAt(state, point, 2);
    expect(next.zoom).toBe(2);
    const before = { x: (point.x - state.x) / state.zoom, y: (point.y - state.y) / state.zoom };
    const after = { x: (point.x - next.x) / next.zoom, y: (point.y - next.y) / next.zoom };
    expect(after).toEqual(before);
  });
  it("changes nothing past a limit", () => {
    const state = { zoom: 8, x: 5, y: 5 };
    expect(zoomAt(state, { x: 50, y: 50 }, 2)).toEqual(state);
  });
  it("takes its own limits, so a fit scale below 0.25 can zoom out", () => {
    const state = { zoom: 1, x: 0, y: 0 };
    expect(zoomAt(state, { x: 0, y: 0 }, 0.5, 0.1, 4).zoom).toBe(0.5);
    expect(zoomAt(state, { x: 0, y: 0 }, 0.01, 0.1, 4).zoom).toBe(0.1);
    expect(zoomAt(state, { x: 0, y: 0 }, 100, 0.1, 4).zoom).toBe(4);
    expect(zoomAt(state, { x: 0, y: 0 }, 0.01).zoom).toBe(0.25);
  });
});

describe("percentOf, zoomKey, wheelFactor", () => {
  it("shows zoom on top of fit as a rounded percentage", () => {
    expect(percentOf(1, 1)).toBe(100);
    expect(percentOf(1.25, 0.5)).toBe(63);
    expect(percentOf(2, 1)).toBe(200);
  });
  it("maps the keys + - 0", () => {
    expect(zoomKey("+")).toBe("in");
    expect(zoomKey("=")).toBe("in");
    expect(zoomKey("-")).toBe("out");
    expect(zoomKey("0")).toBe("reset");
    expect(zoomKey("a")).toBeNull();
  });
  it("zooms in for a scroll up and out for a scroll down", () => {
    expect(wheelFactor(-100)).toBeGreaterThan(1);
    expect(wheelFactor(100)).toBeLessThan(1);
    expect(wheelFactor(0)).toBe(1);
  });
});
