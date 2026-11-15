import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as X from "@xdev-asia/ui";
import { previews } from "../demo/previews";

// The gallery on ui.xdev.asia scales each preview to its stage from `style`; one entry without it blanked the whole page.
describe("demo previews", () => {
  for (const [name, p] of Object.entries(previews)) {
    it(`${name} has a stage style and renders`, () => {
      expect(p.style, `${name}.style`).toBeTypeOf("object");
      expect(renderToStaticMarkup(p.render(X, createElement)).length).toBeGreaterThan(0);
    });
  }
});
