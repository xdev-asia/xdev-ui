import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { Badge, type BadgeTone } from "./Badge";

describe("Badge", () => {
  it("sets data-status", () => {
    expect(renderToStaticMarkup(<Badge status="new">new</Badge>)).toContain('data-status="new"');
  });
  it("omits data-status for neutral", () => {
    const html = renderToStaticMarkup(<Badge status="neutral">x</Badge>);
    expect(html).toContain('class="badge"');
    expect(html).not.toContain("data-status");
  });
  it("tone danger sets data-tone; className passes through", () => {
    const html = renderToStaticMarkup(<Badge tone="danger" className="extra">failed</Badge>);
    expect(html).toBe('<span class="badge extra" data-tone="danger">failed</span>');
  });
  it.each<BadgeTone>(["neutral", "accent", "ok", "warn", "danger"])("tone %s sets data-tone", (tone) => {
    expect(renderToStaticMarkup(<Badge tone={tone}>{tone}</Badge>)).toBe(`<span class="badge" data-tone="${tone}">${tone}</span>`);
  });
  it("spreads HTML attributes onto the span", () => {
    const html = renderToStaticMarkup(
      <Badge tone="ok" title="Signed in today" id="b1" role="status" aria-label="Active user" data-testid="state">
        active
      </Badge>,
    );
    expect(html).toContain('title="Signed in today"');
    expect(html).toContain('id="b1"');
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Active user"');
    expect(html).toContain('data-testid="state"');
    expect(html).toMatch(/^<span [^>]*class="badge"[^>]*>active<\/span>$/);
  });
  it("keeps status and tone; tone rules come after status rules so the tone wins", () => {
    const html = renderToStaticMarkup(<Badge status="new" tone="danger">x</Badge>);
    expect(html).toContain('data-status="new"');
    expect(html).toContain('data-tone="danger"');
    const css = readFileSync(new URL("../../styles/display.css", import.meta.url), "utf8");
    const lastStatus = css.lastIndexOf(".badge[data-status=");
    for (const tone of ["neutral", "accent", "ok", "warn", "danger"]) {
      expect(css.indexOf(`.badge[data-tone="${tone}"]`)).toBeGreaterThan(lastStatus);
    }
  });
});
