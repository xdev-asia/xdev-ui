import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useId: () => ":c1:" }));
const { Card } = await import("./Card");

describe("Card", () => {
  it("is a section named by its title", () => {
    const html = renderToStaticMarkup(
      <Card title="Agent context" subtitle="CLAUDE.md" monoSubtitle actions={<button type="button">Edit</button>}>
        body
      </Card>,
    );
    expect(html).toContain('<section class="x-card" aria-labelledby="x-card-:c1:">');
    expect(html).toContain('<h3 class="x-card-title" id="x-card-:c1:">Agent context</h3>');
    expect(html).toContain('<p class="x-card-sub ws-mono">CLAUDE.md</p>');
    expect(html).toContain('<div class="x-card-actions"><button type="button">Edit</button></div>');
    expect(html).toContain('<div class="x-card-body">body</div>');
  });
  it("skips the head when empty and supports flush bodies", () => {
    const html = renderToStaticMarkup(<Card flush>diff</Card>);
    expect(html).not.toContain("x-card-head");
    expect(html).not.toContain("aria-labelledby");
    expect(html).toContain('data-flush=""');
  });
  it("headingLevel picks the heading element; default h3", () => {
    expect(renderToStaticMarkup(<Card title="Users" headingLevel={2} />)).toContain('<h2 class="x-card-title" id="x-card-:c1:">Users</h2>');
    expect(renderToStaticMarkup(<Card title="Users" headingLevel={6} />)).toContain("<h6 ");
  });
  it("titleAside sits after the heading, outside it", () => {
    const html = renderToStaticMarkup(<Card title="Models" titleAside={<select aria-label="Mode" />} />);
    expect(html).toContain('<div class="x-card-title-row"><h3 class="x-card-title" id="x-card-:c1:">Models</h3><select aria-label="Mode"></select></div>');
    expect(renderToStaticMarkup(<Card title="Models" />)).not.toContain("x-card-title-row");
  });
});
