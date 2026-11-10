import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Identity } from "./Identity";

describe("Identity", () => {
  it("shows the name and the detail, with a decorative large avatar", () => {
    const html = renderToStaticMarkup(<Identity name="Ada Lovelace" detail="ada@example.com" />);
    expect(html).toContain('class="x-identity" data-size="lg"');
    expect(html).toContain('<span class="x-identity-avatar" aria-hidden="true">');
    expect(html).toContain('<strong class="x-identity-name">Ada Lovelace</strong>');
    expect(html).toContain('<span class="x-identity-detail">ada@example.com</span>');
  });
  it("leaves out an empty detail and passes the size and picture on", () => {
    const html = renderToStaticMarkup(<Identity name="Ada" size="md" src="/a.png" />);
    expect(html).not.toContain("x-identity-detail");
    expect(html).toContain('data-size="md"');
    expect(html).toContain('src="/a.png"');
  });
});
