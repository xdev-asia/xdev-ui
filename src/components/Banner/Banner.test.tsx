import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Banner } from "./Banner";

it("renders a status banner with title, text and action", () => {
  const html = renderToStaticMarkup(
    <Banner title="Paused" action={<button type="button">Retry</button>}>
      Waiting
    </Banner>,
  );
  expect(html).toContain('role="status"');
  expect(html).toContain("banner-warn");
  expect(html).toContain("<strong>Paused</strong>");
  expect(html).toContain("Waiting");
  expect(html).toContain("Retry");
});
