import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Select } from "./Select";

describe("Select", () => {
  it("renders options with lang-select class", () => {
    const html = renderToStaticMarkup(
      <Select
        aria-label="Language"
        options={[
          { value: "en", label: "English" },
          { value: "vi", label: "Tiếng Việt" },
        ]}
      />,
    );
    expect(html).toContain("lang-select");
    expect(html).toContain('<option value="vi">');
    expect(html).toContain('aria-label="Language"');
  });
  it("passes ref to the native select", () => {
    const ref = { current: null };
    const tree = Select({ options: [], ref });
    expect(tree.type).toBe("select");
    expect(tree.props.ref).toBe(ref);
  });
  it("draws a leading icon and keeps the class on the select", () => {
    const html = renderToStaticMarkup(<Select icon="globe" className="c" aria-label="Language" options={[{ value: "en", label: "English" }]} />);
    expect(html).toMatch(/^<span class="x-select-wrap"><svg class="x-icon x-select-icon"[^>]*aria-hidden="true"/);
    expect(html).toContain('<select class="lang-select c" data-icon="" aria-label="Language">');
  });
  it("label wraps it in a ws-field with a linked hint or error", () => {
    const opts = [{ value: "a", label: "A" }];
    const html = renderToStaticMarkup(<Select id="hour" label="Hour" hint="Station time" options={opts} />);
    expect(html).toContain('<div class="ws-field x-select-field"><label for="hour">Hour</label><select class="lang-select" id="hour" aria-describedby="hour-hint">');
    expect(html).toContain('<small id="hour-hint">Station time</small>');
    const bad = renderToStaticMarkup(<Select id="h" label="Hour" hint="x" error="Pick one" hideLabel options={opts} className="c" />);
    expect(bad).toContain('<div class="ws-field x-select-field c" data-invalid="">');
    expect(bad).toContain('<label for="h" class="x-sr-only">Hour</label>');
    expect(bad).toContain('aria-invalid="true"');
    expect(bad).toContain('<small id="h-hint">Pick one</small>');
  });
});
