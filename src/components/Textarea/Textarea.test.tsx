import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("is a labelled textarea with a linked hint", () => {
    const html = renderToStaticMarkup(<Textarea id="p" label="System prompt" hint="Sent before every task" />);
    expect(html).toContain('for="p"');
    expect(html).toContain("<textarea");
    expect(html).toContain('aria-describedby="p-hint"');
    expect(html).toContain('data-resize="vertical"');
    expect(html).not.toContain("ws-mono");
  });
  it("error replaces the hint and marks invalid", () => {
    const html = renderToStaticMarkup(<Textarea id="p" label="Env" hint="hintText" error="Use KEY=value lines." />);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("data-invalid");
    expect(html).not.toContain("hintText");
  });
  it("mono and resize", () => {
    const html = renderToStaticMarkup(<Textarea label="Env" mono resize="none" />);
    expect(html).toContain("kit-textarea ws-mono");
    expect(html).toContain('data-resize="none"');
  });
});
