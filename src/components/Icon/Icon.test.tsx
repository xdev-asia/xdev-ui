import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ICON_NAMES } from "../../icons";
import { Icon } from "./Icon";

describe("Icon", () => {
  it("is decorative without label", () => {
    const html = renderToStaticMarkup(<Icon name="terminal" />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role="img"');
  });
  it("is an img with label", () => {
    const html = renderToStaticMarkup(<Icon name="terminal" label="Terminal" />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Terminal"');
  });
  it("renders every registered name as svg", () => {
    for (const name of ICON_NAMES) expect(renderToStaticMarkup(<Icon name={name} />), name).toContain("<svg");
  });
});
