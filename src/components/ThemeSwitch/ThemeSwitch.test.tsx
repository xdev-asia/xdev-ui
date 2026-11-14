import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ThemeSwitch } from "./ThemeSwitch";

describe("ThemeSwitch", () => {
  it("renders System, Dark, Light in order with the value pressed", () => {
    const html = renderToStaticMarkup(<ThemeSwitch value="dark" onChange={() => {}} />);
    expect(html).toContain('aria-label="Theme"');
    expect(html.indexOf("System")).toBeLessThan(html.indexOf("Dark"));
    expect(html.indexOf("Dark")).toBeLessThan(html.indexOf("Light"));
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-pressed="true"[^>]*>Dark</);
  });
  it("uses labels over the English defaults", () => {
    const labels = { group: "§g§", system: "§s§", dark: "§d§", light: "§l§" };
    const html = renderToStaticMarkup(<ThemeSwitch value="system" onChange={() => {}} labels={labels} />);
    for (const v of Object.values(labels)) expect(html).toContain(v);
    expect(html).not.toMatch(/System|Dark|Light|Theme/);
  });
  it("passes a known preference to onChange and drops an unknown one", () => {
    const onChange = vi.fn();
    const el = ThemeSwitch({ value: "system", onChange });
    el.props.onChange("light");
    el.props.onChange("sepia");
    expect(onChange.mock.calls).toEqual([["light"]]);
  });
  it("passes disabled on to the segments", () => {
    expect(renderToStaticMarkup(<ThemeSwitch value="dark" onChange={() => {}} disabled />).match(/disabled=""/g)).toHaveLength(3);
  });
  it("icon variant: one button that flips to the other theme", () => {
    const dark = renderToStaticMarkup(<ThemeSwitch variant="icon" value="dark" onChange={() => {}} />);
    expect(dark).toContain('aria-label="Switch to light mode"');
    expect(dark.match(/<button/g)).toHaveLength(1);
    expect(dark).not.toContain("aria-pressed");
    const light = renderToStaticMarkup(<ThemeSwitch variant="icon" value="light" onChange={() => {}} labels={{ toDark: "§d§" }} />);
    expect(light).toContain('aria-label="§d§"');
  });
  it("icon variant: on system it flips the resolved theme", () => {
    const onChange = vi.fn();
    ThemeSwitch({ variant: "icon", value: "system", resolved: "light", onChange }).props.onClick();
    ThemeSwitch({ variant: "icon", value: "system", onChange }).props.onClick();
    expect(onChange.mock.calls).toEqual([["dark"], ["light"]]);
  });
});
