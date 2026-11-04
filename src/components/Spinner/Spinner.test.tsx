import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("is a status with a hidden text label", () => {
    const html = renderToStaticMarkup(<Spinner />);
    expect(html).toBe(
      '<span class="x-spinner" role="status" data-size="sm"><span class="x-spinner-ring" aria-hidden="true"></span><span class="x-sr-only">Loading</span></span>',
    );
  });
  it("takes a specific label and size", () => {
    const html = renderToStaticMarkup(<Spinner size="md" label="Loading usage" />);
    expect(html).toContain('data-size="md"');
    expect(html).toContain(">Loading usage<");
  });
});
