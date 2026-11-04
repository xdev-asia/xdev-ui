import { describe, expect, it } from "vitest";
import { applyUiFont, FONT_NAME_MAX, fontStack, UI_FONT_SUGGESTIONS } from "./font";

function root() {
  const props = new Map<string, string>();
  return {
    props,
    style: {
      setProperty: (k: string, v: string) => void props.set(k, v),
      removeProperty: (k: string) => props.delete(k),
    },
  };
}

describe("fontStack", () => {
  it("puts the name first and the fallback token after it", () => {
    expect(fontStack("Inter")).toBe('"Inter", var(--x-font-body-fallback)');
  });
  it("reads an empty or blank name as the default", () => {
    expect(fontStack("")).toBeNull();
    expect(fontStack("  \t")).toBeNull();
  });
  it("drops characters that could end the declaration", () => {
    expect(fontStack('Evil"; color: red')).toBe('"Evil color: red", var(--x-font-body-fallback)');
    expect(fontStack("a{b}\\c\u0000")).toBe('"abc", var(--x-font-body-fallback)');
  });
  it("caps the name", () => {
    const out = fontStack("a".repeat(500))!;
    expect(out).toBe(`"${"a".repeat(FONT_NAME_MAX)}", var(--x-font-body-fallback)`);
  });
});

describe("applyUiFont", () => {
  it("sets --font-body, and clears it for an empty name", () => {
    const r = root();
    applyUiFont(r, "Inter");
    expect(r.props.get("--font-body")).toBe('"Inter", var(--x-font-body-fallback)');
    applyUiFont(r, "");
    expect(r.props.has("--font-body")).toBe(false);
  });
});

it("suggests a handful of families, none empty", () => {
  expect(UI_FONT_SUGGESTIONS.length).toBeGreaterThan(2);
  expect(UI_FONT_SUGGESTIONS.every((f) => f.trim() === f && f !== "")).toBe(true);
});
