import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { ListRow } from "./ListRow";

describe("ListRow", () => {
  it("renders a button row with title, meta and trailing outside the button", () => {
    const html = renderToStaticMarkup(
      <ListRow title="feat/tabs" meta="2 min ago" leading={<i>dot</i>} trailing={<b>3</b>} selected onClick={() => {}} />,
    );
    expect(html).toContain('<div class="x-list-row" data-selected="">');
    expect(html).toContain('<button type="button" class="x-list-row-main" aria-current="true">');
    expect(html).toContain('<span class="x-list-row-lead"><i>dot</i></span>');
    expect(html).toContain('<span class="x-list-row-meta">2 min ago</span>');
    expect(html).toMatch(/<\/button><span class="x-list-row-trail"><b>3<\/b><\/span>/);
  });
  it("is static without onClick and can be a list item", () => {
    const html = renderToStaticMarkup(<ListRow as="li" title="main" disabled />);
    expect(html).toContain('<li class="x-list-row" data-disabled="">');
    expect(html).not.toContain("<button");
  });
  it("wires onClick", () => {
    const onClick = vi.fn();
    findAll(ListRow({ title: "x", onClick }), (e) => e.type === "button")[0].props.onClick();
    expect(onClick).toHaveBeenCalled();
  });
});
