import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ShellTitle } from "./ShellTitle";

describe("ShellTitle", () => {
  it("renders the title as the one h1, after its icon", () => {
    const html = renderToStaticMarkup(<ShellTitle icon="plug" title="Providers" />);
    expect(html).toContain('<h1 class="x-shell-title-text">Providers</h1>');
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html.indexOf("x-shell-title-icon")).toBeLessThan(html.indexOf("<h1"));
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("x-shell-title-desc");
    expect(html).not.toContain("x-shell-title-parent");
  });
  it("renders the description under the title", () => {
    const html = renderToStaticMarkup(<ShellTitle icon="plug" title="Providers" description="Manage your provider connections" />);
    expect(html).toContain('<p class="x-shell-title-desc">Manage your provider connections</p>');
    expect(html.indexOf("<h1")).toBeLessThan(html.indexOf("x-shell-title-desc"));
    // The description sits under the icon and title row, not beside the icon.
    expect(html.indexOf("x-shell-title-row")).toBeLessThan(html.indexOf("x-shell-title-icon"));
    expect(html.lastIndexOf("</div>", html.indexOf("x-shell-title-desc"))).toBeGreaterThan(html.indexOf("</h1>"));
  });
  it("shows a media node in place of the icon", () => {
    const html = renderToStaticMarkup(<ShellTitle media={<img alt="" src="/openai.svg" />} icon="plug" title="OpenAI" />);
    expect(html).toContain('<img alt="" src="/openai.svg"/>');
    expect(html).not.toContain("<svg");
  });
  it("links back to the parent page before the title", () => {
    const html = renderToStaticMarkup(<ShellTitle parent={{ label: "Providers", href: "#/providers" }} title="OpenAI" />);
    expect(html).toContain('<a class="x-shell-title-parent" href="#/providers">Providers</a>');
    expect(html.indexOf("x-shell-title-parent")).toBeLessThan(html.indexOf("<h1"));
    expect(html).toContain('<nav aria-label="Providers / OpenAI"');
  });
  it("names the trail with the given label", () => {
    const html = renderToStaticMarkup(<ShellTitle parent={{ label: "Providers", href: "#/providers" }} title="OpenAI" labels={{ trail: "Đường dẫn" }} />);
    expect(html).toContain('<nav aria-label="Đường dẫn"');
  });
});
