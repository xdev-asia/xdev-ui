import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Prose } from "./Prose";

describe("Prose", () => {
  it("is an article by default", () => {
    expect(renderToStaticMarkup(<Prose><p>x</p></Prose>)).toBe('<article class="x-prose"><p>x</p></article>');
  });
  it("takes an element and attributes", () => {
    expect(renderToStaticMarkup(<Prose as="section" id="s" className="c">x</Prose>)).toBe(
      '<section id="s" class="x-prose c">x</section>',
    );
  });
});
