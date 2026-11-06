import { Editor } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import { clampHeadingLevel, editorExtensions, isSafeUrl } from "./extensions";

// Headless editor (no element): Markdown parse and serialize run without a DOM.
function roundTrip(markdown: string): string {
  const editor = new Editor({ element: null, extensions: editorExtensions(), content: markdown, contentType: "markdown" });
  try {
    return editor.getMarkdown();
  } finally {
    editor.destroy();
  }
}

describe("isSafeUrl", () => {
  it("accepts absolute http(s) URLs only", () => {
    expect(isSafeUrl("https://xdev.asia/a?b=1")).toBe(true);
    expect(isSafeUrl("  http://example.com  ")).toBe(true);
    for (const bad of ["javascript:alert(1)", "data:text/html,x", "/relative", "mailto:a@b.c", "https://", "https://a b", "ftp://x", ""])
      expect(isSafeUrl(bad), bad).toBe(false);
  });
});

describe("clampHeadingLevel", () => {
  it("maps every level onto 2 or 3", () => {
    expect([1, 2, 3, 4, 5, 6, undefined].map(clampHeadingLevel)).toEqual([2, 2, 3, 3, 3, 3, 2]);
  });
});

const doc =
  "## Guide\n\nA **bold**, *italic* and [link](https://xdev.asia) paragraph.\n\n- one\n- two\n\n1. one\n2. two\n\n> quote\n\n![Cover](/media/0193a1b2-0000-7000-8000-000000000001)";

describe("editor Markdown", () => {
  it("is stable after the first save and keeps every supported format", () => {
    const once = roundTrip(doc);
    expect(roundTrip(once)).toBe(once);
    for (const s of ["## Guide", "**bold**", "*italic*", "](https://xdev.asia)", "- one", "1. one", "> quote", "![Cover](/media/0193a1b2-0000-7000-8000-000000000001)"])
      expect(once).toContain(s);
  });
  it("drops underline and script HTML", () => {
    expect(roundTrip("<u>x</u> <script>alert(1)</script>")).not.toMatch(/<script|<u>/);
  });
  it("keeps only headings 2 and 3", () => {
    const out = roundTrip("# One\n\n#### Four\n\n### Three");
    expect(out).not.toMatch(/^#\s|^#{4}\s/m);
    expect(out).toContain("## One");
    expect(out).toContain("### Four");
    expect(out).toContain("### Three");
  });
  it("does not link javascript: URLs but keeps their text", () => {
    const out = roundTrip("[click](javascript:alert(1))");
    expect(out).not.toContain("javascript:");
    expect(out).toContain("click");
  });
  it("never writes the editor-only uploading flag", () => {
    const editor = new Editor({
      element: null,
      extensions: editorExtensions(),
      content: { type: "doc", content: [{ type: "image", attrs: { src: "/media/x", alt: "a", uploading: true } }] },
    });
    expect(editor.getMarkdown()).toBe("![a](/media/x)");
    editor.destroy();
  });
});
