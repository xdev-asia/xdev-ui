import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteShell } from "./SiteShell";

describe("SiteShell", () => {
  it("renders the bar, the main region and the footer links", () => {
    const html = renderToStaticMarkup(
      <SiteShell
        brand={<a href="/">xDev account</a>}
        actions={<button type="button">Lang</button>}
        links={[{ href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }]}
        linksLabel="Legal"
      >
        page
      </SiteShell>,
    );
    expect(html).toContain('<header class="x-site-header"><div class="x-container x-site-bar" data-size="md">');
    expect(html).toContain('<div class="x-site-brand"><a href="/">xDev account</a></div>');
    expect(html).toContain('<div class="x-site-actions"><button type="button">Lang</button></div>');
    expect(html).toContain('<main class="x-container x-site-main" data-size="md">page</main>');
    expect(html).toContain('<nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>');
  });
  it("leaves out empty actions and footer, and takes a size", () => {
    const html = renderToStaticMarkup(<SiteShell brand="b" size="lg">x</SiteShell>);
    expect(html).not.toContain("x-site-actions");
    expect(html).not.toContain("<footer");
    expect(html).toContain('data-size="lg"');
  });
});
