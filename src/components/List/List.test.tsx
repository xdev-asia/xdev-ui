import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { List } from "./List";

describe("List", () => {
  it("is a plain ul with the row gap by default", () => {
    expect(renderToStaticMarkup(<List><li>a</li></List>)).toBe('<ul class="x-list"><li>a</li></ul>');
  });
  it("takes ordered, a gap and attributes", () => {
    const html = renderToStaticMarkup(<List ordered gap={2} aria-label="Steps" className="c"><li>a</li></List>);
    expect(html).toBe('<ol aria-label="Steps" class="x-list c" data-gap="2"><li>a</li></ol>');
  });
});
