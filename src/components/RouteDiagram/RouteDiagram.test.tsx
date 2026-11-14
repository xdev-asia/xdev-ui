import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RouteDiagram } from "./RouteDiagram";

describe("RouteDiagram", () => {
  const html = renderToStaticMarkup(
    <RouteDiagram
      label="Request route"
      inputs={[
        { id: "agents", label: "Coding agents", icon: "terminal" },
        { id: "apps", label: "Your apps", icon: "code", detail: "SDK" },
      ]}
      hub={{ name: "ai-router", mark: <svg data-mark="" />, detail: "/v1" }}
      outputs={[{ id: "keys", label: "API keys", icon: "key" }]}
    />,
  );

  it("is a named figure with every node and the hub in words", () => {
    expect(html).toContain('<figure class="x-route" aria-label="Request route"');
    for (const s of ["Coding agents", "Your apps", "SDK", "ai-router", "/v1", "API keys"]) expect(html).toContain(s);
    expect(html).toContain("data-mark");
  });

  it("puts inputs on the in side and outputs on the out side, with one line each", () => {
    expect(html.match(/<li class="x-route-node"/g)).toHaveLength(3);
    expect(html).toMatch(/data-side="in">.*Coding agents.*<\/ul><span class="x-route-line" data-side="in" aria-hidden="true">/);
    expect(html).toMatch(/data-side="out">.*API keys/);
    expect(html.match(/class="x-route-line"/g)).toHaveLength(2);
  });
});
