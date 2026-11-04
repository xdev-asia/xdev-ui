import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Breadcrumb } from "./Breadcrumb";

describe("Breadcrumb", () => {
  const onClick = vi.fn();
  const items = [
    { label: "xdev", onClick },
    { label: "apps/desktop", href: "#desktop", mono: true },
    { label: "FileTree.tsx", mono: true },
  ];
  it("is a named nav with an ordered list and a current last crumb", () => {
    const html = renderToStaticMarkup(<Breadcrumb items={items} />);
    expect(html).toContain('<nav class="ws-crumbs" aria-label="Breadcrumb"><ol');
    expect(html.match(/<li/g)).toHaveLength(3);
    expect(html.match(/class="ws-crumb-sep" aria-hidden="true"/g)).toHaveLength(2);
    expect(html).toContain('<span class="ws-crumb ws-mono" aria-current="page">FileTree.tsx</span>');
    expect(html).toContain('<a class="ws-crumb ws-mono" href="#desktop">');
    expect(html).toContain('<button type="button" class="ws-crumb">xdev</button>');
  });
  it("wires button crumbs", () => {
    findAll(Breadcrumb({ items }), (e) => e.type === "button")[0].props.onClick();
    expect(onClick).toHaveBeenCalled();
  });
});
