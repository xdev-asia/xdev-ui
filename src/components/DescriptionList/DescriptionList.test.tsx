import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DescriptionList } from "./DescriptionList";

const items = [
  { term: "Email", value: "ada@example.com", mono: true },
  { term: "Role", value: "Owner" },
];

describe("DescriptionList", () => {
  it("renders a dl with a dt/dd pair per item", () => {
    const html = renderToStaticMarkup(<DescriptionList items={items} />);
    expect(html).toContain('<dl class="x-dl" data-layout="rows">');
    expect(html.match(/<dt/g)).toHaveLength(2);
    expect(html.match(/<dd/g)).toHaveLength(2);
    expect(html).toContain('<dd class="x-dl-value ws-mono">ada@example.com</dd>');
    expect(html).toContain('<dd class="x-dl-value">Owner</dd>');
  });
  it("supports the columns layout", () => {
    expect(renderToStaticMarkup(<DescriptionList items={items} layout="columns" />)).toContain('data-layout="columns"');
  });
});
