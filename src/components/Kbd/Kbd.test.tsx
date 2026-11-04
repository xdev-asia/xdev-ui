import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Kbd } from "./Kbd";

it("renders kbd.kbd", () => {
  expect(renderToStaticMarkup(<Kbd>Ctrl</Kbd>)).toBe('<kbd class="kbd">Ctrl</kbd>');
});
