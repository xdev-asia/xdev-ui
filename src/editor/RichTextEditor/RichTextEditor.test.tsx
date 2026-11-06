import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { minHeightValue } from "./RichTextEditor";

// A stand-in for the Tiptap editor: enough for the toolbar and image bar to render on the server.
const active = new Set<string>();
const fake = {
  isDestroyed: false,
  isEditable: true,
  options: { editorProps: {} },
  state: { selection: {} },
  isActive: (name: string, attrs?: { level?: number }) => active.has(attrs?.level ? `${name}${attrs.level}` : name),
  can: () => ({ undo: () => false, redo: () => true }),
};
let current: typeof fake | null = null;

vi.mock("@tiptap/react", () => ({
  useEditor: () => current,
  useEditorState: ({ editor, selector }: { editor: unknown; selector: (s: { editor: unknown }) => unknown }) => selector({ editor }),
  EditorContent: () => <div data-testid="content" />,
}));
vi.mock("react", async (orig) => ({ ...(await orig<typeof import("react")>()), useId: () => ":e1:" }));
const { RichTextEditor } = await import("./RichTextEditor");

const render = (props: Partial<Parameters<typeof RichTextEditor>[0]> = {}): string =>
  renderToStaticMarkup(<RichTextEditor label="Body" value="" onChange={() => {}} {...props} />);

describe("RichTextEditor", () => {
  it("renders an empty busy frame before the editor exists (server, first paint)", () => {
    current = null;
    const html = render({ minHeight: 320 });
    expect(html).toContain('<span id="x-editor-:e1:" class="x-editor-label">Body</span>');
    expect(html).toContain('<div class="x-editor-content" aria-busy="true"></div>');
    expect(html).toContain("--editor-min-height:320px");
    expect(html).not.toContain('role="toolbar"');
  });

  it("keeps a hidden label for screen readers and marks invalid and disabled", () => {
    current = null;
    const html = render({ hideLabel: true, invalid: true, disabled: true });
    expect(html).toContain('class="x-sr-only">Body</span>');
    expect(html).toContain("data-invalid");
    expect(html).toContain("data-disabled");
  });

  it("renders a named toolbar with pressed toggles and one tab stop", () => {
    current = fake;
    active.clear();
    active.add("bold").add("heading2");
    const html = render();
    expect(html).toContain('role="toolbar" aria-label="Formatting"');
    expect(html).toMatch(/data-x-tool="bold" aria-label="Bold" title="Bold" aria-pressed="true"/);
    expect(html).toMatch(/data-x-tool="italic" aria-label="Italic" title="Italic" aria-pressed="false"/);
    expect(html).toContain('title="Link (Ctrl+K)"');
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
    expect(html).toMatch(/data-x-tool="heading2"[^>]*tabindex="0"/);
    expect(html).toMatch(/data-x-tool="undo"[^>]*disabled=""/);
    expect(html).not.toMatch(/data-x-tool="redo"[^>]*disabled=""/);
    expect(html).toContain('<div data-testid="content"></div>');
  });

  it("shows the image button and file input only with onUploadImage", () => {
    current = fake;
    expect(render()).not.toContain('data-x-tool="image"');
    expect(render()).not.toContain('type="file"');
    const html = render({ onUploadImage: async () => "/media/a.webp" });
    expect(html).toContain('data-x-tool="image" aria-label="Insert image"');
    expect(html).toContain('accept="image/jpeg,image/png,image/webp"');
  });

  it("disables every tool when disabled", () => {
    current = fake;
    const html = render({ disabled: true });
    expect(html.match(/data-x-tool=/g)?.length).toBe(html.match(/data-x-tool="[^"]+"[^>]*disabled=""/g)?.length);
  });
});

describe("minHeightValue", () => {
  it("reads numbers as px and passes CSS lengths through", () => {
    expect(minHeightValue(undefined)).toBeUndefined();
    expect(minHeightValue(200)).toBe("200px");
    expect(minHeightValue("20rem")).toBe("20rem");
  });
});
