import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("is one hidden line by default and says nothing", () => {
    expect(renderToStaticMarkup(<Skeleton />)).toBe(
      '<span class="x-skeleton" data-shape="line"><span class="x-skeleton-bar" aria-hidden="true"></span></span>',
    );
  });
  it("renders n lines and marks the last one shorter", () => {
    const html = renderToStaticMarkup(<Skeleton lines={3} />);
    expect(html.match(/x-skeleton-bar/g)).toHaveLength(3);
    expect(html.match(/data-last="true"/g)).toHaveLength(1);
  });
  it("ignores lines for block and circle", () => {
    expect(renderToStaticMarkup(<Skeleton shape="block" lines={4} />).match(/x-skeleton-bar/g)).toHaveLength(1);
    expect(renderToStaticMarkup(<Skeleton shape="circle" height="40px" />)).toContain('style="height:40px"');
  });
  it("announce makes it a status with a screen reader label", () => {
    const html = renderToStaticMarkup(<Skeleton announce labels={{ loading: "Đang tải" }} />);
    expect(html).toContain('role="status"');
    expect(html).toContain('<span class="x-sr-only">Đang tải</span>');
  });
});
