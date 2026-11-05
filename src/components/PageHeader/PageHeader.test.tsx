import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title as the one h1", () => {
    const html = renderToStaticMarkup(<PageHeader title="Users" />);
    expect(html).toContain('<h1 class="x-page-title">Users</h1>');
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).not.toContain("x-page-actions");
  });
  it("renders description, meta, actions and breadcrumb", () => {
    const html = renderToStaticMarkup(
      <PageHeader title="Ada" description="Owner" meta={<span>Active</span>} actions={<button type="button">Edit</button>} breadcrumb={<nav>Crumb</nav>} />,
    );
    expect(html).toContain('<p class="x-page-desc">Owner</p>');
    expect(html).toContain('<div class="x-page-meta"><span>Active</span></div>');
    expect(html).toContain('<div class="x-page-actions"><button type="button">Edit</button></div>');
    expect(html.indexOf("Crumb")).toBeLessThan(html.indexOf("<h1"));
  });
});
