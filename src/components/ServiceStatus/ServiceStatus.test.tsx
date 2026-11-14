import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ServiceStatus } from "./ServiceStatus";

describe("ServiceStatus", () => {
  it("says the state in words beside the dot, with the detail after", () => {
    const html = renderToStaticMarkup(<ServiceStatus tone="ok" label="Gateway online" detail="v1.4.0" />);
    expect(html).toContain('data-tone="ok"');
    expect(html).toContain("Gateway online");
    expect(html).toContain('<span class="x-service-status-detail">v1.4.0</span>');
  });

  it("leaves the detail out when there is none", () => {
    expect(renderToStaticMarkup(<ServiceStatus tone="danger" label="Down" />)).not.toContain("x-service-status-detail");
  });
});
