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

it("defaults to warn and supports info, ok and danger tones", () => {
  expect(renderToStaticMarkup(<Banner title="x" />)).toContain('class="banner banner-warn"');
  expect(renderToStaticMarkup(<Banner title="x" tone="info" />)).toContain('class="banner banner-info" role="status"');
  expect(renderToStaticMarkup(<Banner title="x" tone="ok" />)).toContain('class="banner banner-ok" role="status"');
  expect(renderToStaticMarkup(<Banner title="x" tone="danger" />)).toContain('class="banner banner-danger" role="alert"');
});
