import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { StatusBar } from "./StatusBar";

it("renders items and a spacer", () => {
  const html = renderToStaticMarkup(<StatusBar items={["main", "spacer", "UTF-8"]} />);
  expect(html).toContain("<footer");
  expect(html).toContain("ws-footer-spacer");
  expect(html.match(/ws-footer-item/g)).toHaveLength(2);
});
