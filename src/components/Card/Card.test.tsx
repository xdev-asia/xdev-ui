import { readFileSync } from "node:fs";
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

  it("spreads HTML attributes onto the section and bodyClassName onto the body", () => {
    const onClick = () => {};
    const html = renderToStaticMarkup(
      <Card id="usage" role="region" aria-describedby="usage-hint" data-testid="usage-card" onClick={onClick} bodyClassName="grid gap-2" className="wide">
        body
      </Card>,
    );
    expect(html).toContain('<section id="usage" role="region" aria-describedby="usage-hint" data-testid="usage-card" class="x-card wide">');
    expect(html).toContain('<div class="x-card-body grid gap-2">body</div>');
  });
  it("names the section by its title over a passed aria-labelledby; keeps the passed one without a title", () => {
    expect(renderToStaticMarkup(<Card title="Users" aria-labelledby="other" />)).toContain('aria-labelledby="x-card-:c1:"');
    expect(renderToStaticMarkup(<Card aria-labelledby="other" />)).toContain('aria-labelledby="other"');
  });
  it("renders no head without a title, subtitle or actions", () => {
    const html = renderToStaticMarkup(<Card bodyClassName="b">x</Card>);
    expect(html).toBe('<section class="x-card"><div class="x-card-body b">x</div></section>');
  });

  it("wraps a long subtitle instead of ending it in an ellipsis", () => {
    const css = readFileSync(new URL("../../styles/display.css", import.meta.url), "utf8");
    const rule = css.match(/\.x-card-sub \{([^}]*)\}/)?.[1] ?? "";
    expect(rule).not.toMatch(/white-space: nowrap|text-overflow: ellipsis/);
    expect(rule).toMatch(/overflow-wrap: anywhere;/);
  });
});
