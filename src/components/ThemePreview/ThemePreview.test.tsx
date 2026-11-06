import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemePreview } from "./ThemePreview";

const text = { title: "Preview", sample: "Sample", hint: "Hint", button: "Button" };

describe("ThemePreview", () => {
  it("sets data-theme from mode", () => {
    expect(renderToStaticMarkup(<ThemePreview mode="dark" {...text} />)).toContain('data-theme="dark"');
    expect(renderToStaticMarkup(<ThemePreview mode="light" {...text} />)).toContain('data-theme="light"');
  });
  it("shows the texts and three status dots", () => {
    const html = renderToStaticMarkup(<ThemePreview mode="dark" {...text} />);
    for (const t of Object.values(text)) expect(html).toContain(t);
    expect(html).toContain('aria-label="Preview"');
    for (const tone of ["ok", "warn", "danger"]) expect(html).toContain(`data-tone="${tone}"`);
  });
});
