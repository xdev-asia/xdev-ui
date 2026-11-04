import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Meter } from "./Meter";

describe("Meter", () => {
  it("exposes meter semantics", () => {
    const html = renderToStaticMarkup(<Meter value={82} label="Context" warnAt={80} />);
    expect(html).toContain('role="meter"');
    expect(html).toContain('aria-valuenow="82"');
    expect(html).toContain("data-warn");
    expect(html).toContain("82%");
  });
  it("clamps and does not warn below the threshold", () => {
    const html = renderToStaticMarkup(<Meter value={150} warnAt={200} />);
    expect(html).toContain('aria-valuenow="100"');
    expect(html).not.toContain("data-warn");
  });
});
