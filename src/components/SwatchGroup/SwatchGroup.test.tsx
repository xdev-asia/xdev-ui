import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { SwatchGroup } from "./SwatchGroup";

const options = [
  { value: "red", label: "Red", tone: "danger" as const },
  { value: "amber", label: "Amber", tone: "warning" as const },
  { value: "blue", label: "Blue", tone: "accent" as const },
  { value: "white", label: "White", tone: "neutral" as const },
];

describe("SwatchGroup", () => {
  it("is a named radiogroup of radio buttons named by their label", () => {
    const html = renderToStaticMarkup(<SwatchGroup aria-label="Colour" value="amber" onChange={() => {}} options={options} />);
    expect(html).toContain('role="radiogroup" aria-label="Colour"');
    expect(html.match(/role="radio"/g)).toHaveLength(4);
    for (const o of options) expect(html).toContain(`aria-label="${o.label}"`);
    for (const tone of ["danger", "warning", "accent", "neutral"]) expect(html).toContain(`data-tone="${tone}"`);
    expect(html).toContain('data-size="md"');
    expect(html).not.toContain("<svg");
  });
  it("marks only the selected option checked and makes it the single tab stop", () => {
    const html = renderToStaticMarkup(<SwatchGroup aria-label="Colour" value="blue" onChange={() => {}} options={options} size="sm" />);
    expect(html.match(/aria-checked="true"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-checked="true"[^>]*aria-label="Blue"[^>]*tabindex="0"/);
    expect(html.match(/tabindex="-1"/g)).toHaveLength(3);
    expect(html).toContain('data-size="sm"');
  });
  it("falls back to the first option as tab stop when value matches nothing", () => {
    const html = renderToStaticMarkup(<SwatchGroup aria-label="Colour" value="" onChange={() => {}} options={options} />);
    expect(html).not.toContain('aria-checked="true"');
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
  });
  it("click calls onChange with the option value", () => {
    const onChange = vi.fn();
    const root = SwatchGroup({ "aria-label": "Colour", value: "red", onChange, options });
    findAll(root, (e) => e.props.role === "radio")[2].props.onClick();
    expect(onChange).toHaveBeenCalledWith("blue");
  });
  it("arrow keys move the selection, wrap, and focus the new swatch", () => {
    const onChange = vi.fn();
    const focus = vi.fn();
    const root = SwatchGroup({ "aria-label": "Colour", value: "white", onChange, options });
    const press = (key: string) => {
      const preventDefault = vi.fn();
      root.props.onKeyDown({ key, preventDefault, currentTarget: { querySelectorAll: () => options.map(() => ({ focus })) } });
      return preventDefault;
    };
    expect(press("ArrowRight")).toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith("red");
    press("ArrowLeft");
    expect(onChange).toHaveBeenLastCalledWith("blue");
    press("ArrowDown");
    expect(onChange).toHaveBeenLastCalledWith("red");
    press("ArrowUp");
    expect(onChange).toHaveBeenLastCalledWith("blue");
    expect(focus).toHaveBeenCalledTimes(4);
    onChange.mockClear();
    expect(press("a")).not.toHaveBeenCalled();
    press("Home");
    expect(onChange).not.toHaveBeenCalled();
  });
});
