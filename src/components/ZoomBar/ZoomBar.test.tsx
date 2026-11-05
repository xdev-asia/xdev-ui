import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { IconButton } from "../IconButton/IconButton";
import { ZoomBar } from "./ZoomBar";

const noop = () => {};
const bar = (zoom: number | null, labels?: object) => (
  <ZoomBar zoom={zoom} onZoomOut={noop} onFit={noop} onZoomIn={noop} onActual={noop} labels={labels} />
);

describe("ZoomBar", () => {
  it("is a labelled toolbar with the English labels", () => {
    const html = renderToStaticMarkup(bar(100));
    expect(html).toContain('role="toolbar"');
    for (const label of ["Zoom out", "Fit to view", "Zoom in", "Actual size"]) expect(html).toContain(`aria-label="${label}"`);
  });
  it("shows the percentage, or a dash before the content has a size", () => {
    expect(renderToStaticMarkup(bar(125))).toContain(">125%<");
    expect(renderToStaticMarkup(bar(null))).toContain(">—<");
  });
  it("takes translated labels", () => {
    const html = renderToStaticMarkup(bar(100, { zoomIn: "Phóng to", actual: "Kích thước thật" }));
    expect(html).toContain('aria-label="Phóng to"');
    expect(html).toContain('aria-label="Kích thước thật"');
  });
  it("wires the four buttons", () => {
    const [out, fit, inn, actual] = [vi.fn(), vi.fn(), vi.fn(), vi.fn()];
    const tree = ZoomBar({ zoom: 100, onZoomOut: out, onFit: fit, onZoomIn: inn, onActual: actual });
    const icons = findAll(tree, (e) => e.type === IconButton);
    expect(icons.map((i) => i.props.icon)).toEqual(["minus", "maximize", "plus"]);
    icons.forEach((i) => i.props.onClick());
    findAll(tree, (e) => e.type === "button")[0].props.onClick();
    expect([out, fit, inn, actual].map((f) => f.mock.calls.length)).toEqual([1, 1, 1, 1]);
  });
});
