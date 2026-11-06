import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Container } from "./Container";

describe("Container", () => {
  it("is an xl div with a gutter by default", () => {
    expect(renderToStaticMarkup(<Container>x</Container>)).toBe('<div class="x-container" data-size="xl">x</div>');
  });
  it("takes a size, an element and no gutter", () => {
    const html = renderToStaticMarkup(<Container as="main" size="md" gutter={false} id="m">x</Container>);
    expect(html).toBe('<main id="m" class="x-container" data-size="md" data-gutter="false">x</main>');
  });
});
