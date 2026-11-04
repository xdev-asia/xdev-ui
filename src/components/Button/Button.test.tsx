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
});
