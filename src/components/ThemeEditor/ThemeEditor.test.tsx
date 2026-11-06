import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";
import { Segmented } from "../Segmented/Segmented";
import { ThemeEditor, type ThemeEditorProps } from "./ThemeEditor";

const h = (digits: string): string => `#${digits}`;

const props: ThemeEditorProps = {
  mode: "dark",
  onMode: () => {},
  name: "Midnight",
  onName: () => {},
  groups: [
    { id: "surface", title: "Surfaces", keys: [{ key: "bg", label: "Background" }, { key: "panel", label: "Panel" }] },
    { id: "accent", title: "Accent", keys: [{ key: "accent", label: "Accent colour" }] },
  ],
  colors: { bg: h("0a0f1e"), panel: h("0f1629"), accent: h("2f62e6") },
  overridden: new Set(["accent"]),
  onColor: () => {},
  onReset: () => {},
  issues: [],
  labels: {
    name: "Theme name",
    mode: "Mode",
    dark: "Dark",
    light: "Light",
    reset: "Reset {token}",
    picker: "Pick {token}",
    invalid: "Not a colour",
    preview: { title: "Preview", sample: "Sample", hint: "Hint", button: "Button" },
    issuesTitle: "Contrast",
    noIssues: "All pairs pass",
  },
};

describe("ThemeEditor", () => {
  it("renders every group and key", () => {
    const html = renderToStaticMarkup(<ThemeEditor {...props} />);
    expect(html.match(/<fieldset/g)).toHaveLength(2);
    for (const t of ["Surfaces", "Accent", "Background", "Panel", "Accent colour"]) expect(html).toContain(t);
    for (const k of ["bg", "panel", "accent"]) expect(html).toContain(`data-key="${k}"`);
    expect(html).toContain('aria-label="Reset Panel"');
    expect(html).toContain('aria-label="Pick Accent colour"');
    expect(html).toContain('value="Midnight"');
    expect(html).toContain('data-theme="dark"');
  });
  it("calls onMode from the mode switch", () => {
    const onMode = vi.fn();
    const root = ThemeEditor({ ...props, onMode });
    const seg = findAll(root, (e) => e.type === Segmented)[0];
    seg.props.onChange("light");
    expect(onMode).toHaveBeenCalledWith("light");
  });
  it("shows the no-issue text when clean", () => {
    const html = renderToStaticMarkup(<ThemeEditor {...props} />);
    expect(html).toContain("All pairs pass");
    expect(html).not.toContain("<ul");
    expect(html).toContain('aria-live="polite"');
  });
  it("lists issues with the key label and a live count", () => {
    const issues = [
      { key: "accent", message: "Contrast 2.9" },
      { key: "bg", message: "Contrast 1.2" },
    ];
    const html = renderToStaticMarkup(<ThemeEditor {...props} issues={issues} />);
    expect(html).toContain('role="list"');
    expect(html.match(/<li data-key/g)).toHaveLength(2);
    expect(html).toContain("<strong>Accent colour</strong> Contrast 2.9");
    expect(html).toContain("<strong>Background</strong> Contrast 1.2");
    expect(html).toMatch(/aria-live="polite"[^>]*><span[^>]*>2<\/span>/);
    expect(html).not.toContain("All pairs pass");
  });
  it("renders the children slot and the name error", () => {
    const html = renderToStaticMarkup(
      <ThemeEditor {...props} nameError="Too long">
        <p>extra</p>
      </ThemeEditor>,
    );
    expect(html).toContain("<p>extra</p>");
    expect(html).toContain("Too long");
    expect(html).toContain('aria-invalid="true"');
  });
});
