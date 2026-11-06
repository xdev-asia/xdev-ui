import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("defaults to type=button and class btn", () => {
    const html = renderToStaticMarkup(<Button>Go</Button>);
    expect(html).toContain('type="button"');
    expect(html).toContain('class="btn"');
  });
  it("secondary variant uses btn-secondary", () => {
    expect(renderToStaticMarkup(<Button variant="secondary">Go</Button>)).toContain("btn-secondary");
  });
  it("allows type=submit and renders the icon", () => {
    const html = renderToStaticMarkup(
      <Button type="submit" icon="search">
        Go
      </Button>,
    );
    expect(html).toContain('type="submit"');
    expect(html).toContain("x-icon");
  });
  it("wires onClick", () => {
    const onClick = vi.fn();
    Button({ onClick }).props.onClick();
    expect(onClick).toHaveBeenCalledOnce();
  });
  it("danger, ghost and link variants have their own class", () => {
    expect(renderToStaticMarkup(<Button variant="danger">Delete</Button>)).toContain('class="btn-danger"');
    expect(renderToStaticMarkup(<Button variant="ghost">More</Button>)).toContain('class="btn-ghost"');
    expect(renderToStaticMarkup(<Button variant="link">Open</Button>)).toContain('class="btn-link"');
  });
  it("size sm sets data-size, md (default) sets nothing", () => {
    expect(renderToStaticMarkup(<Button size="sm">Go</Button>)).toContain('data-size="sm"');
    expect(renderToStaticMarkup(<Button>Go</Button>)).not.toContain("data-size");
  });
  it("passes ref through", () => {
    const ref = { current: null };
    expect(Button({ ref, children: "Go" }).props.ref).toBe(ref);
  });
  it("href renders an anchor with the same classes", () => {
    const html = renderToStaticMarkup(
      <Button href="/docs" variant="secondary" icon="search">
        Docs
      </Button>,
    );
    expect(html).toMatch(/^<a /);
    expect(html).toContain('href="/docs"');
    expect(html).toContain('class="btn-secondary"');
    expect(html).not.toContain("type=");
  });
  it("disabled href drops href and sets aria-disabled", () => {
    const html = renderToStaticMarkup(
      <Button href="/docs" disabled>
        Docs
      </Button>,
    );
    expect(html).not.toContain("href=");
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toContain(" disabled=");
  });
});
