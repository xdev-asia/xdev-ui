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
    expect(bad).toContain('<small id="h-hint" role="alert">Pick one</small>');
  });
  it("takes native option and optgroup children when there are no options", () => {
    const html = renderToStaticMarkup(
      <Select aria-label="Model" defaultValue="b">
        <optgroup label="Fast">
          <option value="a">A</option>
        </optgroup>
        <optgroup label="Large">
          <option value="b">B</option>
        </optgroup>
      </Select>,
    );
    expect(html).toContain('<select class="lang-select" aria-label="Model"><optgroup label="Fast"><option value="a">A</option></optgroup><optgroup label="Large"><option value="b" selected="">B</option></optgroup></select>');
  });
  it("children also work in the labelled form", () => {
    const html = renderToStaticMarkup(
      <Select id="r" label="Role">
        <option value="admin">Admin</option>
      </Select>,
    );
    expect(html).toContain('<select class="lang-select" id="r"><option value="admin">Admin</option></select>');
  });
  it("options win over children when both are given", () => {
    const html = renderToStaticMarkup(
      <Select aria-label="X" options={[{ value: "o", label: "From options" }]}>
        <option value="c">From children</option>
      </Select>,
    );
    expect(html).toContain("From options");
    expect(html).not.toContain("From children");
  });
  it("size sm marks the select and the icon wrap; md adds nothing", () => {
    const opts = [{ value: "a", label: "A" }];
    expect(renderToStaticMarkup(<Select aria-label="S" size="sm" options={opts} />)).toContain('<select class="lang-select" data-size="sm" aria-label="S">');
    const withIcon = renderToStaticMarkup(<Select aria-label="S" size="sm" icon="globe" options={opts} />);
    expect(withIcon).toMatch(/^<span class="x-select-wrap" data-size="sm"><svg class="x-icon x-select-icon" width="14" height="14"/);
    expect(withIcon).toContain('<select class="lang-select" data-icon="" data-size="sm"');
    const md = renderToStaticMarkup(<Select aria-label="S" size="md" icon="globe" options={opts} />);
    expect(md).not.toContain("data-size");
    expect(md).toContain('width="16"');
  });
});
