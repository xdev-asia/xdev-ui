import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ColorField, commitHexText, normalizeHex } from "./ColorField";

const h = (digits: string): string => `#${digits}`;
const labels = { reset: "Reset accent", picker: "Pick accent", invalid: "Not a colour" };
const base = { label: "Accent", value: h("2f62e6"), overridden: false, onChange: () => {}, onReset: () => {}, labels };

describe("normalizeHex", () => {
  const table: [string, string | null][] = [
    [h("2F62E6"), h("2f62e6")],
    ["2f62e6", h("2f62e6")],
    [h("abc"), h("aabbcc")],
    ["ABC", h("aabbcc")],
    [`  ${h("FfF")}  `, h("ffffff")],
    ["", null],
    [h(""), null],
    [h("12"), null],
    [h("1234"), null],
    [h("12345"), null],
    [h("1234567"), null],
    [h("ggg"), null],
    ["red", null],
    [h("12 456"), null],
  ];
  it.each(table)("%j gives %j", (text, out) => {
    expect(normalizeHex(text)).toBe(out);
  });
});

describe("ColorField", () => {
  it("commits a valid text once, normalised", () => {
    const onChange = vi.fn();
    expect(commitHexText("ABC", onChange)).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(h("aabbcc"));
  });
  it("does not commit an invalid text", () => {
    const onChange = vi.fn();
    expect(commitHexText(h("12"), onChange)).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });
  it("marks a bad value aria-invalid and shows the message; a good one does neither", () => {
    const bad = renderToStaticMarkup(<ColorField {...base} value="nope" />);
    expect(bad).toContain('aria-invalid="true"');
    expect(bad).toContain("Not a colour");
    const good = renderToStaticMarkup(<ColorField {...base} />);
    expect(good).not.toContain("aria-invalid");
    expect(good).not.toContain("Not a colour");
  });
  it("enables reset only when overridden", () => {
    expect(renderToStaticMarkup(<ColorField {...base} />)).toMatch(/<button[^>]*aria-label="Reset accent"[^>]*disabled=""/);
    expect(renderToStaticMarkup(<ColorField {...base} overridden />)).not.toMatch(/<button[^>]*disabled/);
  });
  it("labels the swatch and passes data-* and id through", () => {
    const html = renderToStaticMarkup(<ColorField {...base} id="c1" data-key="accent" data-x="1" />);
    expect(html).toContain('aria-label="Pick accent"');
    expect(html).toContain('data-key="accent"');
    expect(html).toContain('data-x="1"');
    expect(html).toContain('for="c1"');
    expect(html).toContain('id="c1"');
    expect(html).toContain(`value="${h("2f62e6")}"`);
  });
});
