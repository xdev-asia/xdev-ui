import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EndpointPanel } from "./EndpointPanel";

describe("EndpointPanel", () => {
  it("shows the URL whole, a heading and the paths as a named list", () => {
    const html = renderToStaticMarkup(<EndpointPanel title="Endpoint" description="Point a client here." url="https://gw.example/v1" urlLabel="Base URL" paths={["/v1/chat/completions", "/v1/models"]} />);
    expect(html).toMatch(/<h2[^>]*>Endpoint<\/h2>/);
    expect(html).toContain("Point a client here.");
    expect(html).toContain("https://gw.example/v1");
    expect(html).toContain("Base URL");
    expect(html).toContain('aria-label="Paths"');
    expect(html.match(/class="x-endpoint-path"/g)).toHaveLength(2);
    expect(html).not.toContain("x-endpoint-aside");
  });

  it("renders the aside and marks the body for two columns", () => {
    const html = renderToStaticMarkup(<EndpointPanel title="Endpoint" url="u" aside={<p>route</p>} />);
    expect(html).toContain('class="x-endpoint-body" data-aside=""');
    expect(html).toContain('<div class="x-endpoint-aside"><p>route</p></div>');
    expect(html).not.toContain("<ul");
  });

  it("takes translated labels", () => {
    const html = renderToStaticMarkup(<EndpointPanel title="Điểm cuối" url="u" paths={["/v1/models"]} labels={{ paths: "Đường dẫn" }} headingLevel={3} />);
    expect(html).toContain('aria-label="Đường dẫn"');
    expect(html).toMatch(/<h3[^>]*>Điểm cuối<\/h3>/);
  });
});
