import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ICON_NAMES, type IconName } from "../../icons";
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
  it("every name is aria-hidden unless a label is given", () => {
    for (const name of ICON_NAMES) {
      const bare = renderToStaticMarkup(<Icon name={name} />);
      expect(bare, name).toMatch(/^<svg /);
      expect(bare, name).toContain('aria-hidden="true"');
      expect(bare, name).not.toContain("aria-label");
      const named = renderToStaticMarkup(<Icon name={name} label="Thing" />);
      expect(named, name).not.toContain("aria-hidden");
      expect(named, name).toContain('role="img"');
      expect(named, name).toContain('aria-label="Thing"');
    }
  });
  it("keeps the path data of the app svgs it replaces", () => {
    const html = (name: IconName): string => renderToStaticMarkup(<Icon name={name} />);
    expect(html("chevron-left")).toContain('d="M15 6l-6 6 6 6"');
    expect(html("chevron-right")).toContain('d="M9 6l6 6-6 6"');
    expect(html("magnifier")).toContain('d="m20 20-3.5-3.5"');
    expect(html("prompt")).toContain('d="m5 8 5 4-5 4M12 17h7"');
    expect(html("folder")).toContain('d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"');
    expect(html("file")).toContain('d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5"');
    expect(html("check")).toContain('d="m5 12 5 5L20 7"');
    expect(html("alert")).toContain('d="M12 9v4M12 17h.01"');
    expect(html("warn-dash")).toContain('d="M12 3 2 20h20zM12 10v4M12 17v.5"');
  });
});
