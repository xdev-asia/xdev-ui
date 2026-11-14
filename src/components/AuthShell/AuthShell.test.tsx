import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AuthShell } from "./AuthShell";

describe("AuthShell", () => {
  it("renders the showcase and the form pane", () => {
    const html = renderToStaticMarkup(
      <AuthShell
        brand={<a href="/">ai-router</a>}
        actions={<button type="button">Lang</button>}
        headline="One gateway"
        tagline="Every model"
        footer="© 2026"
      >
        <h1>Sign in</h1>
      </AuthShell>,
    );
    expect(html).toContain('<div class="x-auth"><aside class="x-auth-showcase"><div class="x-auth-art"><div class="x-auth-orbit" aria-hidden="true">');
    expect(html).toContain('<div class="x-auth-pitch"><p class="x-auth-headline">One gateway</p><p class="x-auth-tagline">Every model</p></div>');
    expect(html).toContain('<header class="x-auth-bar"><div class="x-auth-brand"><a href="/">ai-router</a></div><div class="x-auth-actions"><button type="button">Lang</button></div></header>');
    expect(html).toContain('<main class="x-auth-main"><div class="x-auth-form"><h1>Sign in</h1></div></main></div><footer class="x-auth-footer">© 2026</footer></div>');
    expect(html.match(/ai-router/g)).toHaveLength(1);
  });
  it("takes its own art and leaves out empty parts", () => {
    const html = renderToStaticMarkup(
      <AuthShell brand="b" art={<svg role="img" aria-label="Map" />} className="extra">
        form
      </AuthShell>,
    );
    expect(html).toContain('<div class="x-auth extra">');
    expect(html).toContain('<div class="x-auth-art"><svg role="img" aria-label="Map"></svg></div>');
    expect(html).not.toContain("x-auth-orbit");
    expect(html).not.toContain("x-auth-pitch");
    expect(html).not.toContain("x-auth-actions");
    expect(html).not.toContain("<footer");
  });
});
