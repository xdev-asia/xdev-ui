import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findAll } from "../../test-utils";

const setInner = vi.fn();
vi.mock("react", async (orig) => ({
  ...(await orig<typeof import("react")>()),
  useState: (v: unknown) => [v, setInner],
  useRef: (v: unknown) => ({ current: v }),
  useEffect: () => {},
}));
const { CodeBlock } = await import("./CodeBlock");

const code = "claude mcp add xdev -- npx -y -p @xdev-asia/ui xdev-ui-mcp";

describe("CodeBlock", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setInner.mockClear();
  });
  it("renders the code verbatim with a hidden copy button before hydration", () => {
    const html = renderToStaticMarkup(<CodeBlock code={code} language="bash" />);
    expect(html).toContain('<span class="connect-lang">bash</span>');
    expect(html).toContain('data-copy="idle" hidden=""');
    expect(html).toContain('<span aria-live="polite">Copy</span>');
    expect(html).toContain(`<pre><code>${code}</code></pre>`);
  });
  it("writes to the clipboard and flips to copied", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const onCopy = vi.fn();
    findAll(CodeBlock({ code, onCopy }), (e) => e.type === "button")[0].props.onClick();
    await vi.waitFor(() => expect(onCopy).toHaveBeenCalledWith(code));
    expect(writeText).toHaveBeenCalledWith(code);
    expect(setInner).toHaveBeenCalledWith(true);
  });
  it("stays idle when the clipboard refuses", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const onCopy = vi.fn();
    findAll(CodeBlock({ code, onCopy }), (e) => e.type === "button")[0].props.onClick();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalled());
    await Promise.resolve();
    expect(onCopy).not.toHaveBeenCalled();
    expect(setInner).not.toHaveBeenCalled();
  });
});
