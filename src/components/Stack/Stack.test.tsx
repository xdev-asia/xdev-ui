import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Stack } from "./Stack";

describe("Stack", () => {
  it("is a column with gap 3 by default", () => {
    expect(renderToStaticMarkup(<Stack>a</Stack>)).toBe('<div class="x-stack" data-direction="column" data-gap="3">a</div>');
  });
  it("a row centres and wraps by default", () => {
    expect(renderToStaticMarkup(<Stack direction="row">a</Stack>)).toBe(
      '<div class="x-stack" data-direction="row" data-gap="3" data-align="center" data-wrap="true">a</div>',
    );
  });
  it("passes align, justify, wrap, element and class", () => {
    const html = renderToStaticMarkup(<Stack as="ul" direction="row" gap={6} align="end" justify="between" wrap={false} className="c">a</Stack>);
    expect(html).toBe('<ul class="x-stack c" data-direction="row" data-gap="6" data-align="end" data-justify="between">a</ul>');
  });
});
