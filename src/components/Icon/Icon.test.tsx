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
    expect(html("restore")).toContain('d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"');
    expect(html("history")).toContain('d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"');
    expect(html("bot")).toContain('d="M5 10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM12 8V4M10 4h4M9.5 13h.01M14.5 13h.01"');
    expect(html("download")).toContain('d="M12 4v11M7 10l5 5 5-5M5 20h14"');
    expect(html("copy")).toContain('d="M11 9h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM5 15V6a2 2 0 0 1 2-2h9"');
    expect(html("plug")).toContain('d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0zM12 16v5"');
    expect(html("lock")).toContain('d="M7 11h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zM8 11V8a4 4 0 0 1 8 0v3"');
  });
});
