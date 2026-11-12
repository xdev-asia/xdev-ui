import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResourceCard } from "./ResourceCard";

describe("ResourceCard", () => {
  it("is a link when it has an href, with the leading mark, the title and the status inside it", () => {
    const html = renderToStaticMarkup(<ResourceCard href="#/providers/openai" leading={<i>logo</i>} title="OpenAI" status="2 connected" />);
    expect(html).toContain('<div class="x-resource-card">');
    expect(html).toContain('<a class="x-resource-card-main" href="#/providers/openai">');
    expect(html).toContain('<span class="x-resource-card-lead"><i>logo</i></span>');
    expect(html).toContain('<span class="x-resource-card-title">OpenAI</span>');
    expect(html).toContain('<span class="x-resource-card-status">2 connected</span>');
    expect(html).not.toContain("<button");
  });

  it("is a button when it has only onClick", () => {
    const html = renderToStaticMarkup(<ResourceCard title="OpenAI" onClick={() => {}} />);
    expect(html).toContain('<button type="button" class="x-resource-card-main">');
    expect(html).not.toContain("<a ");
  });

  it("is static text without href and onClick", () => {
    const html = renderToStaticMarkup(<ResourceCard title="OpenAI" status="No connections" />);
    expect(html).toContain('<div class="x-resource-card-main">');
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("<button");
  });

  it("keeps the trailing control outside the link, so a switch in it is not nested in the link", () => {
    const html = renderToStaticMarkup(<ResourceCard href="/x" title="OpenAI" trailing={<input type="checkbox" role="switch" aria-label="Use OpenAI" />} />);
    const link = html.slice(html.indexOf("<a "), html.indexOf("</a>"));
    expect(link).not.toContain("switch");
    expect(html).toContain('<span class="x-resource-card-trail"><input type="checkbox" role="switch" aria-label="Use OpenAI"/></span>');
  });

  it("leaves out the parts it was not given", () => {
    const html = renderToStaticMarkup(<ResourceCard title="OpenAI" />);
    for (const part of ["x-resource-card-lead", "x-resource-card-status", "x-resource-card-trail"]) expect(html, part).not.toContain(part);
  });

  it("marks a switched-off thing and a hover-only trailing control for the stylesheet", () => {
    expect(renderToStaticMarkup(<ResourceCard title="T" />)).not.toContain("data-");
    expect(renderToStaticMarkup(<ResourceCard title="T" dimmed />)).toContain('data-dimmed=""');
    expect(renderToStaticMarkup(<ResourceCard title="T" trailing="x" revealTrailing="hover" />)).toContain('data-reveal="hover"');
  });

  it("renders the link through renderLink, for a router's link component", () => {
    const html = renderToStaticMarkup(
      <ResourceCard href="/providers/openai" title="OpenAI" renderLink={(p) => <a data-router="" href={p.href} className={p.className}>{p.children}</a>} />,
    );
    expect(html).toContain('<a data-router="" href="/providers/openai" class="x-resource-card-main">');
  });
});
